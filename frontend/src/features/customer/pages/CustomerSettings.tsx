import { useEffect, useState } from 'react';
import { ArrowRight, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../auth/context/AuthContext';
import { authService } from '../../auth/services/auth.service';
import type { UserSettings } from '../../auth/services/auth.service';
import { notificationService } from '../services/notification.service';

const defaultSettings: UserSettings = {
  notificationPreferences: {
    serviceUpdates: true,
    aiUpdates: true,
    accountSecurityAlerts: true,
  },
  appLanguage: 'English',
  preferredServiceTime: '09:00 AM - 06:00 PM',
};

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'தமிழ்' },
  { value: 'Telugu', label: 'తెలుగు' },
  { value: 'Hindi', label: 'हिन्दी' },
];

function toInputTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
}

function toDisplayTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function serviceTimeDraft(value: string) {
  const [start, end] = value.split(/\s+-\s+/);
  return { start: toInputTime(start || ''), end: toInputTime(end || '') };
}

function settingsFromProfile(settings?: UserSettings): UserSettings {
  return {
    ...defaultSettings,
    ...settings,
    notificationPreferences: {
      ...defaultSettings.notificationPreferences,
      ...settings?.notificationPreferences,
    },
    appLanguage: settings?.appLanguage || defaultSettings.appLanguage,
    preferredServiceTime: settings?.preferredServiceTime || defaultSettings.preferredServiceTime,
  };
}

function PreferenceToggle({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function CustomerSettings() {
  const { user, profile, loading: authLoading, refreshAuthenticatedProfile } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [timeDraft, setTimeDraft] = useState(() => serviceTimeDraft(defaultSettings.preferredServiceTime));
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsLoadError, setSettingsLoadError] = useState(false);
  const [settingsLoadAttempt, setSettingsLoadAttempt] = useState(0);
  const [preferenceSaving, setPreferenceSaving] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = user?.uid;

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const loadSettings = async () => {
      setSettingsLoading(true);
      setSettingsLoadError(false);
      setError('');
      try {
        if (!userId) throw new Error('You must be logged in to load settings.');
        const freshProfile = await authService.getUserProfile(userId);
        if (!freshProfile) throw new Error('Your customer profile could not be found.');
        if (!active) return;
        const savedSettings = settingsFromProfile(freshProfile.settings);
        setSettings(savedSettings);
        setTimeDraft(serviceTimeDraft(savedSettings.preferredServiceTime));
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setSettingsLoadError(true);
          setError('Unable to load your settings. Please try again.');
        }
      } finally {
        if (active) setSettingsLoading(false);
      }
    };
    void loadSettings();
    return () => { active = false; };
  }, [authLoading, settingsLoadAttempt, userId]);

  const saveSettings = async (nextSettings: UserSettings) => {
    if (!user) return;
    setPreferenceSaving(true);
    setError('');
    setMessage('');
    try {
      await authService.updateUserSettings(user.uid, nextSettings);
      setSettings(nextSettings);
      setMessage('Settings updated successfully.');
      void refreshAuthenticatedProfile().catch((refreshError) => {
        console.error('Settings were saved, but the authenticated profile could not be refreshed:', refreshError);
      });
    } catch (saveError) {
      console.error(saveError);
      setError('Unable to save your settings. Please try again.');
    } finally {
      setPreferenceSaving(false);
    }
  };

  const updateNotification = (key: keyof UserSettings['notificationPreferences'], value: boolean) => {
    void saveSettings({
      ...settings,
      notificationPreferences: { ...settings.notificationPreferences, [key]: value },
    });
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!user) return;
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setError('Complete all password fields.');
      return;
    }
    if (passwords.next.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(user, passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setChangePasswordOpen(false);
      await notificationService.createAccountNotification('password-changed');
      setMessage('Password changed successfully.');
    } catch (passwordError) {
      console.error(passwordError);
      setError('Unable to change password. Check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await authService.deleteAccount(user);
      navigate('/login', { replace: true });
    } catch (deleteError) {
      console.error(deleteError);
      setError('Unable to delete your account. Please try again.');
      setDeleteOpen(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  if (authLoading || settingsLoading) {
    return <div className="p-8 text-center text-gray-500">Loading your settings...</div>;
  }
  if (!profile || settingsLoadError) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
        <p>{error || 'Unable to load your settings.'}</p>
        <Button type="button" variant="secondary" onClick={() => setSettingsLoadAttempt((attempt) => attempt + 1)} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Account</p>
        <h1 className="text-3xl font-bold text-gray-900">SETTINGS</h1>
        <p className="text-gray-500 mt-2">Manage your account, preferences and security.</p>
      </div>

      {message && <div className="mb-6 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <SettingsCard title="NOTIFICATIONS" icon={<Bell size={18} />}>
        <SettingRow title="Service Updates" description="Updates about service requests and tickets.">
          <PreferenceToggle checked={settings.notificationPreferences.serviceUpdates} disabled={preferenceSaving || settingsLoading} onChange={(value) => updateNotification('serviceUpdates', value)} />
        </SettingRow>
        <SettingRow title="AI Updates" description="Updates about your AI troubleshooting sessions.">
          <PreferenceToggle checked={settings.notificationPreferences.aiUpdates} disabled={preferenceSaving || settingsLoading} onChange={(value) => updateNotification('aiUpdates', value)} />
        </SettingRow>
        <SettingRow title="Account & Security Alerts" description="Important account and security notifications.">
          <PreferenceToggle checked={settings.notificationPreferences.accountSecurityAlerts} disabled={preferenceSaving || settingsLoading} onChange={(value) => updateNotification('accountSecurityAlerts', value)} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="LANGUAGE & PREFERENCES">
        <SettingRow title="App Language" description="Language used throughout the application.">
          <Select label="" name="appLanguage" aria-label="App Language" options={languageOptions} value={settings.appLanguage} disabled={preferenceSaving || settingsLoading} onChange={(event) => void saveSettings({ ...settings, appLanguage: event.target.value })} className="min-w-36" />
        </SettingRow>
        <SettingRow title="Preferred Service Time" description={settings.preferredServiceTime}>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-gray-500">
              Start
              <input type="time" aria-label="Preferred service start time" value={timeDraft.start} disabled={preferenceSaving || settingsLoading} onChange={(event) => setTimeDraft((current) => ({ ...current, start: event.target.value }))} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700" />
            </label>
            <label className="text-xs font-medium text-gray-500">
              End
              <input type="time" aria-label="Preferred service end time" value={timeDraft.end} disabled={preferenceSaving || settingsLoading} onChange={(event) => setTimeDraft((current) => ({ ...current, end: event.target.value }))} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700" />
            </label>
            <Button type="button" disabled={preferenceSaving || settingsLoading} isLoading={preferenceSaving} onClick={() => {
              if (!timeDraft.start || !timeDraft.end || timeDraft.end <= timeDraft.start) {
                setError('End time must be later than start time.');
                setMessage('');
                return;
              }
              void saveSettings({
                ...settings,
                preferredServiceTime: `${toDisplayTime(timeDraft.start)} - ${toDisplayTime(timeDraft.end)}`,
              });
            }}>Save</Button>
          </div>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="SECURITY" icon={<ShieldAlert size={18} />}>
        <SettingRow title="Change Password" description="Update your account password.">
          <button type="button" onClick={() => { setError(''); setChangePasswordOpen(true); }} className="text-gray-500 hover:text-blue-600"><ArrowRight size={20} /></button>
        </SettingRow>
        <SettingRow title="Delete Account" description="Permanently delete your SmartAssist account.">
          <button type="button" onClick={() => { setError(''); setDeleteOpen(true); }} className="text-gray-500 hover:text-red-600"><ArrowRight size={20} /></button>
        </SettingRow>
      </SettingsCard>

      <div className="mt-8 flex justify-center">
        <Button type="button" variant="secondary" onClick={handleLogout}><LogOut size={18} className="mr-2" />Log Out</Button>
      </div>

      {changePasswordOpen && (
        <Modal title="Change Password" onClose={() => setChangePasswordOpen(false)}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="Current Password" type="password" isPassword value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
            <Input label="New Password" type="password" isPassword value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required />
            <Input label="Confirm New Password" type="password" isPassword value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required />
            <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="secondary" onClick={() => setChangePasswordOpen(false)}>Cancel</Button><Button type="submit" isLoading={loading}>Change Password</Button></div>
          </form>
        </Modal>
      )}

      {deleteOpen && (
        <Modal title="Delete your account?" onClose={() => setDeleteOpen(false)}>
          <p className="text-sm text-gray-600">This action will permanently delete your SmartAssist account and associated customer data.</p>
          <div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)} disabled={loading}>Cancel</Button><Button type="button" variant="danger" onClick={() => void handleDelete()} isLoading={loading}>Delete Account</Button></div>
        </Modal>
      )}
    </div>
  );
}

function SettingsCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <section className="mb-8"><h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-500">{icon}{title}</h2><div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">{children}</div></section>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5 last:border-b-0"><div><p className="font-medium text-gray-900">{title}</p><p className="mt-1 text-sm text-gray-500">{description}</p></div><div className="shrink-0">{children}</div></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900">{title}</h2><button type="button" onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-700" aria-label="Close">×</button></div>{children}</div></div>;
}
