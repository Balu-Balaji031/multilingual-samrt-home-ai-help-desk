import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';

export type NotificationType = 'SERVICE' | 'AI' | 'ACCOUNT';

export interface CustomerNotification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string;
  isRead: boolean;
  createdAt: string;
}

type CustomerNotificationPreferences = {
  serviceUpdates?: boolean;
  aiUpdates?: boolean;
  accountSecurityAlerts?: boolean;
};

function isNotificationEnabled(type: NotificationType, preferences: CustomerNotificationPreferences = {}): boolean {
  if (type === 'SERVICE') return preferences.serviceUpdates !== false;
  if (type === 'AI') return preferences.aiUpdates !== false;
  return preferences.accountSecurityAlerts !== false;
}

function normalizeTimestamp(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : new Date(0).toISOString();
}

function normalizeNotification(id: string, data: Record<string, unknown>): CustomerNotification {
  return {
    notificationId: String(data.notificationId || id),
    userId: String(data.userId || ''),
    type: (data.type || 'SERVICE') as NotificationType,
    title: String(data.title || ''),
    message: String(data.message || ''),
    ticketId: typeof data.ticketId === 'string' ? data.ticketId : undefined,
    isRead: data.isRead === true,
    createdAt: normalizeTimestamp(data.createdAt),
  };
}

export const notificationService = {
  subscribe(onUpdate: (notifications: CustomerNotification[]) => void, onError: (error: Error) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    let notifications: CustomerNotification[] = [];
    let preferences: CustomerNotificationPreferences = {};
    let notificationsLoaded = false;
    let preferencesLoaded = false;
    const emit = () => {
      if (!notificationsLoaded || !preferencesLoaded) return;
      onUpdate(notifications.filter((notification) => (
        notification.userId === user.uid && isNotificationEnabled(notification.type, preferences)
      )));
    };
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      notifications = snapshot.docs
        .map((notification) => normalizeNotification(notification.id, notification.data()))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      notificationsLoaded = true;
      emit();
    }, onError);
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const settings = snapshot.data()?.settings;
      preferences = settings?.notificationPreferences || {};
      preferencesLoaded = true;
      emit();
    }, onError);
    return () => {
      unsubscribeNotifications();
      unsubscribeProfile();
    };
  },

  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
  },

  async createAccountNotification(
    event: 'profile-updated' | 'password-changed',
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const profile = await getDoc(doc(db, 'users', user.uid));
    const preferences = profile.data()?.settings?.notificationPreferences || {};
    if (!isNotificationEnabled('ACCOUNT', preferences)) return;
    const details = event === 'profile-updated'
      ? ['Profile Updated', 'Your SmartAssist profile details were updated successfully.']
      : ['Password Changed', 'Your account password was changed successfully.'];
    const notificationId = `account_${event}_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notificationId), {
      notificationId,
      userId: user.uid,
      type: 'ACCOUNT',
      title: details[0],
      message: details[1],
      isRead: false,
      createdAt: new Date(),
    });
  },
};
