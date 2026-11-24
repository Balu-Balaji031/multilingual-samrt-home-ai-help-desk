import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';

export type AdminNotificationCategory =
  | 'NEW_TECHNICIAN_APPLICATION'
  | 'ASSESSMENT_UPDATE'
  | 'FINAL_APPROVAL_REQUIRED'
  | 'NEW_SERVICE_REQUEST';

export interface AdminNotification {
  notificationId: string;
  userId: string;
  category: AdminNotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type AdminNotificationPreference =
  | 'newTechnicianApplication'
  | 'assessmentUpdates'
  | 'finalApprovalRequired'
  | 'newServiceRequest';

const preferenceByCategory: Record<AdminNotificationCategory, AdminNotificationPreference> = {
  NEW_TECHNICIAN_APPLICATION: 'newTechnicianApplication',
  ASSESSMENT_UPDATE: 'assessmentUpdates',
  FINAL_APPROVAL_REQUIRED: 'finalApprovalRequired',
  NEW_SERVICE_REQUEST: 'newServiceRequest',
};

function isAdminNotificationCategory(value: unknown): value is AdminNotificationCategory {
  return value === 'NEW_TECHNICIAN_APPLICATION'
    || value === 'ASSESSMENT_UPDATE'
    || value === 'FINAL_APPROVAL_REQUIRED'
    || value === 'NEW_SERVICE_REQUEST';
}

function normalizeTimestamp(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : new Date(0).toISOString();
}

function normalizeNotification(id: string, data: Record<string, unknown>): AdminNotification | null {
  if (!isAdminNotificationCategory(data.category)) return null;
  return {
    notificationId: String(data.notificationId || id),
    userId: String(data.userId || ''),
    category: data.category,
    title: String(data.title || ''),
    message: String(data.message || ''),
    isRead: data.isRead === true,
    createdAt: normalizeTimestamp(data.createdAt),
  };
}

async function getAdminUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to access administrator notifications.');
  const profile = await getDoc(doc(db, 'users', user.uid));
  if (!profile.exists() || profile.data().role !== 'admin') {
    throw new Error('Administrator access is required.');
  }
  return user;
}

function eventTimeMillis(value: unknown): number {
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  const time = typeof value === 'string' ? new Date(value).getTime() : Number.NaN;
  if (!Number.isFinite(time)) throw new Error('Notification event timestamp is unavailable.');
  return time;
}

export const adminNotificationService = {
  async subscribe(
    onUpdate: (notifications: AdminNotification[]) => void,
    onError: (error: Error) => void,
  ): Promise<Unsubscribe> {
    const user = await getAdminUser();
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    return onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs
        .map((item) => normalizeNotification(item.id, item.data()))
        .filter((item): item is AdminNotification => item !== null)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      onUpdate(notifications);
    }, onError);
  },

  async markAsRead(notificationId: string): Promise<void> {
    const user = await getAdminUser();
    const notificationRef = doc(db, 'notifications', notificationId);
    const notification = await getDoc(notificationRef);
    if (!notification.exists() || notification.data().userId !== user.uid) {
      throw new Error('Notification not found for this administrator.');
    }
    await updateDoc(notificationRef, { isRead: true });
  },

  async markAllAsRead(notifications: AdminNotification[]): Promise<void> {
    const user = await getAdminUser();
    const unread = notifications.filter((notification) => !notification.isRead && notification.userId === user.uid);
    for (let offset = 0; offset < unread.length; offset += 450) {
      const batch = writeBatch(db);
      unread.slice(offset, offset + 450).forEach(({ notificationId }) => {
        batch.update(doc(db, 'notifications', notificationId), { isRead: true });
      });
      await batch.commit();
    }
  },

  async createWorkflowNotifications(
    category: 'ASSESSMENT_UPDATE' | 'FINAL_APPROVAL_REQUIRED',
    sourceUserId: string,
  ): Promise<void> {
    const actor = auth.currentUser;
    if (!actor) throw new Error('You must be signed in to create workflow notifications.');
    const [actorProfile, sourceProfile] = await Promise.all([
      getDoc(doc(db, 'users', actor.uid)),
      getDoc(doc(db, 'users', sourceUserId)),
    ]);
    if (!actorProfile.exists() || !sourceProfile.exists()) {
      throw new Error('Notification event profile could not be verified.');
    }

    if (actorProfile.data().role !== 'admin') {
      throw new Error('Administrator access is required for this workflow notification.');
    }
    const source = sourceProfile.data();
    const application = source.application;
    let eventTimestamp: unknown;
    let title: string;
    let message: string;

    if (source.role !== 'technician') {
      throw new Error('Assessment notification source must be a technician.');
    }
    const assessment = application?.assessment;
    if (category === 'ASSESSMENT_UPDATE') {
      if (application?.status === 'ASSESSMENT_SCHEDULED') {
        eventTimestamp = assessment?.assignedAt;
        message = 'A technician assessment has been scheduled or updated.';
      } else if (application?.status === 'ASSESSMENT_COMPLETED') {
        eventTimestamp = assessment?.evaluatedAt;
        message = 'A technician assessment result has been recorded.';
      } else {
        throw new Error('Assessment update notification event is not valid.');
      }
      title = 'Assessment Update';
    } else {
      if (application?.status !== 'ASSESSMENT_COMPLETED' || assessment?.result !== 'PASS') {
        throw new Error('Final approval notification event is not valid.');
      }
      eventTimestamp = assessment.evaluatedAt;
      title = 'Final Approval Required';
      message = 'A technician has passed assessment and is ready for final approval.';
    }

    const eventKey = eventTimeMillis(eventTimestamp);
    const admins = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
    await Promise.all(admins.docs.map(async (admin) => {
      const recipientUid = admin.id;
      const notificationId = `admin_${category}_${sourceUserId}_${eventKey}_${recipientUid}`;
      const profileRef = doc(db, 'users', recipientUid);
      const notificationRef = doc(db, 'notifications', notificationId);
      await runTransaction(db, async (transaction) => {
        const [recipient, existing] = await Promise.all([
          transaction.get(profileRef),
          transaction.get(notificationRef),
        ]);
        if (!recipient.exists() || recipient.data().role !== 'admin' || existing.exists()) return;
        const preferences = recipient.data().settings?.notificationPreferences || {};
        if (preferences[preferenceByCategory[category]] === false) return;
        transaction.set(notificationRef, {
          notificationId,
          userId: recipientUid,
          type: 'ADMIN',
          category,
          title,
          message,
          sourceUserId,
          eventAt: eventTimestamp,
          actorId: actor.uid,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      });
    }));
  },
};
