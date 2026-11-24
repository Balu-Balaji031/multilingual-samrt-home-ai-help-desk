import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Bell, LogOut, ShieldAlert, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../auth/context/AuthContext';
import { authService } from '../../auth/services/auth.service';
import type { UserSettings } from '../../auth/services/auth.service';

type AdminNotificationPreference =
  | 'newTechnicianApplication'
  | 'assessmentUpdates'
  | 'finalApprovalRequired'
  | 'newServiceRequest';

const defaultSettings: UserSettings = {
  notificationPreferences: {
    serviceUpdates: true,
    aiUpdates: true,
    accountSecurityAlerts: true,
    newTechnicianApplication: true,
    assessmentUpdates: true,
    finalApprovalRequired: true,
    newServiceRequest: true,
  },
  appLanguage: 'English',
  preferredServiceTime: '09:00 AM - 06:00 PM',
};

function settingsFromProfile(settings?: UserSettings): UserSettings {
  return {
    ...defaultSettings,
    notificationPreferences: {
      ...defaultSettings.notificationPreferences,
      ...settings?.notificationPreferences,
    },
  };
}

function PreferenceToggle({ checked, onChange, disabled }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function AdminSettings() {
  const { user, profile, loading: authLoading, syncAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileNumber || '');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotification, setSavingNotification] = useState<AdminNotificationPreference | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user || authLoading) return () => { active = false; };
    void authService.getUserProfile(user.uid).then((freshProfile) => {
      if (!active) return;
      if (!freshProfile || freshProfile.role !== 'admin') {
        setError('Administrator profile could not be verified.');
        return;
      }
      setSettings(settingsFromProfile(freshProfile.settings));
    }).catch((loadError: unknown) => {
      console.error(loadError);
      if (active) setError('Unable to load saved notification preferences.');
    }).finally(() => {
      if (active) setSettingsLoading(false);
    });
    return () => { active = false; };
  }, [authLoading, user]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    setSavingProfile(true);
    setError('');
    setMessage('');
    try {
      await authService.updateUserProfile(user.uid, {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
      });
      await syncAuthenticatedUser(user);
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      console.error(saveError);
      setError('Unable to save your profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const updateNotification = async (key: AdminNotificationPreference, value: boolean) => {
    if (!user) return;
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      notificationPreferences: { ...settings.notificationPreferences, [key]: value },
    };
    setSettings(nextSettings);
    setError('');
    setMessage('');
    setSavingNotification(key);
    try {
      await authService.updateAdminNotificationPreference(user.uid, key, value);
      setMessage('Notification preferences updated.');
    } catch (saveError) {
      setSettings(previousSettings);
      console.error(saveError);
      setError('Unable to save notification preferences.');
    } finally {
      setSavingNotification(null);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !passwords.current || !passwords.next || !passwords.confirm) {
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
    setSavingPassword(true);
    setError('');
    try {
      await authService.changePassword(user, passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordOpen(false);
      setMessage('Password changed successfully.');
    } catch (passwordError) {
      console.error(passwordError);
      setError('Unable to change password. Check your current password and try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    navigate('/login');
  };

  if (authLoading || !profile || settingsLoading) {
    return <div className="p-8 text-center text-slate-500">Loading your settings...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Administration & Verification</p>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">Manage your administrator account, notifications and security.</p>
      </div>

      {message && <div className="mb-5 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={saveProfile} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeading icon={<UserRound size={18} />} title="Admin Account" description="Manage your administrator account information." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <Input label="Email Address" type="email" readOnly value={profile.email} className="bg-slate-50" />
          <Input label="Mobile Number" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} />
          <Input label="Role" readOnly value={profile.role} className="bg-slate-50" />
        </div>
        <div className="mt-5"><Button type="submit" isLoading={savingProfile}>Save Profile</Button></div>
      </form>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeading icon={<Bell size={18} />} title="Notifications" />
        {savingNotification && <p role="status" className="mb-3 text-sm text-blue-700">Saving notification preferences...</p>}
        <div className="divide-y divide-slate-100">
          <SettingRow title="New Technician Application" description="Get notified when a technician submits an application." checked={settings.notificationPreferences.newTechnicianApplication ?? true} disabled={savingNotification !== null} onChange={(value) => void updateNotification('newTechnicianApplication', value)} />
          <SettingRow title="Assessment Updates" description="Get notified about assessment scheduling and results." checked={settings.notificationPreferences.assessmentUpdates ?? true} disabled={savingNotification !== null} onChange={(value) => void updateNotification('assessmentUpdates', value)} />
          <SettingRow title="Final Approval Required" description="Get notified when a technician is ready for final approval." checked={settings.notificationPreferences.finalApprovalRequired ?? true} disabled={savingNotification !== null} onChange={(value) => void updateNotification('finalApprovalRequired', value)} />
          <SettingRow title="New Service Request" description="Get notified when a new customer service request requires attention." checked={settings.notificationPreferences.newServiceRequest ?? true} disabled={savingNotification !== null} onChange={(value) => void updateNotification('newServiceRequest', value)} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeading icon={<ShieldAlert size={18} />} title="Security" />
        <SettingRow title="Change Password" description="Update your administrator password.">
          <Button type="button" variant="outline" onClick={() => { setError(''); setPasswordOpen(true); }}>Change Password</Button>
        </SettingRow>
      </section>

      <Button type="button" variant="outline" onClick={() => void logout()}><LogOut size={17} className="mr-2" />Log Out</Button>

      {passwordOpen && <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/50 p-4"><form onSubmit={changePassword} className="mx-auto my-16 max-w-lg rounded-xl bg-white p-5 shadow-xl"><h2 className="text-xl font-bold text-slate-900">Change Password</h2><div className="mt-5 space-y-4"><Input label="Current Password" required isPassword value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} /><Input label="New Password" required isPassword value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} /><Input label="Confirm New Password" required isPassword value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} /></div><div className="mt-5 flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button><Button type="submit" isLoading={savingPassword}>Change Password</Button></div></form></div>}
    </div>
  );
}

function SectionHeading({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return <div className="mb-5 flex items-start gap-3"><div className="mt-0.5 text-blue-600">{icon}</div><div><h2 className="font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div></div>;
}

function SettingRow({ title, description, checked, onChange, disabled, children }: { title: string; description: string; checked?: boolean; onChange?: (value: boolean) => void; disabled?: boolean; children?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-medium text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>{onChange && <PreferenceToggle checked={checked ?? false} disabled={disabled} onChange={onChange} />}{children}</div>;
}
