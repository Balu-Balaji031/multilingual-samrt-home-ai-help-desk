import { useEffect, useState } from 'react';
import { Bell, CheckCheck, CheckCircle2, ClipboardCheck, FileCheck2, FileText, Loader2, Ticket } from 'lucide-react';
import { adminNotificationService } from '../services/admin-notification.service';
import type { AdminNotification, AdminNotificationCategory } from '../services/admin-notification.service';

const categoryLabels: Record<AdminNotificationCategory, string> = {
  NEW_TECHNICIAN_APPLICATION: 'New Technician Application',
  ASSESSMENT_UPDATE: 'Assessment Updates',
  FINAL_APPROVAL_REQUIRED: 'Final Approval Required',
  NEW_SERVICE_REQUEST: 'New Service Request',
};

function categoryIcon(category: AdminNotificationCategory) {
  if (category === 'NEW_TECHNICIAN_APPLICATION') return <FileText size={19} />;
  if (category === 'ASSESSMENT_UPDATE') return <ClipboardCheck size={19} />;
  if (category === 'FINAL_APPROVAL_REQUIRED') return <FileCheck2 size={19} />;
  return <Ticket size={19} />;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void adminNotificationService.subscribe(
      (nextNotifications) => {
        if (!active) return;
        setNotifications(nextNotifications);
        setLoading(false);
      },
      (listenerError) => {
        if (!active) return;
        setError(listenerError.message || 'Unable to load administrator notifications.');
        setLoading(false);
      },
    ).then((stop) => {
      if (active) unsubscribe = stop;
      else stop();
    }).catch((loadError: unknown) => {
      if (!active) return;
      setError(loadError instanceof Error ? loadError.message : 'Unable to load administrator notifications.');
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const markAsRead = async (notification: AdminNotification) => {
    setSavingId(notification.notificationId);
    setError('');
    try {
      await adminNotificationService.markAsRead(notification.notificationId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to mark the notification as read.');
    } finally {
      setSavingId('');
    }
  };

  const markAllAsRead = async () => {
    setSavingAll(true);
    setError('');
    try {
      await adminNotificationService.markAllAsRead(notifications);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to mark notifications as read.');
    } finally {
      setSavingAll(false);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Administration & Verification</p>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-600">Application, assessment, approval, and service request updates.</p>
        </div>
        <button
          type="button"
          onClick={() => void markAllAsRead()}
          disabled={unreadCount === 0 || savingAll || loading}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={17} className="mr-2" />
          {savingAll ? 'Saving...' : 'Mark All as Read'}
        </button>
      </div>

      {error && <div role="alert" className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          <Loader2 className="mx-auto mb-3 animate-spin" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          <Bell className="mx-auto mb-3 text-slate-400" />
          <p className="font-medium text-slate-700">No notifications yet.</p>
          <p className="mt-1 text-sm">New admin updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article key={notification.notificationId} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`mt-0.5 rounded-full p-2 ${notification.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                {notification.isRead ? <CheckCircle2 size={19} /> : categoryIcon(notification.category)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                    {!notification.isRead && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-label="Unread" />}
                  </div>
                  <span className="text-xs font-medium text-slate-500">{categoryLabels[notification.category]}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400">{formatTime(notification.createdAt)}</p>
              </div>
              {!notification.isRead && (
                <button
                  type="button"
                  onClick={() => void markAsRead(notification)}
                  disabled={savingAll || savingId === notification.notificationId}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                >
                  {savingId === notification.notificationId ? 'Saving...' : 'Mark as read'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
