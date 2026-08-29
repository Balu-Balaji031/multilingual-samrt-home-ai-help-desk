import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  Check,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  MessageSquare,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sliders,
  Trash2,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react'
import { useMockStore, mockStore } from '../../services/mockStore'
import type { TechnicianNotificationSettings, TechnicianSettings } from '../../types/technicianPortal'

export function TechnicianSettingsPage() {
  const navigate = useNavigate()
  const state = useMockStore()
  const settings = state.technicianSettings
  const profile = state.technicianProfile
  const app = state.application

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 2500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Modals state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false)
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Delete account confirmation input
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Notifications updater
  const handleToggleNotification = (key: keyof TechnicianNotificationSettings) => {
    const nextVal = !settings.notifications[key]
    mockStore.updateTechnicianSettings({
      notifications: {
        ...settings.notifications,
        [key]: nextVal,
      },
    })
    showToast('Notification preferences updated')
  }

  // App Language updater
  const handleLanguageChange = (lang: TechnicianSettings['appLanguage']) => {
    mockStore.updateTechnicianSettings({ appLanguage: lang })
    showToast('App language updated')
  }

  // Contact Method updater
  const handleContactMethodChange = (method: TechnicianSettings['preferredContactMethod']) => {
    mockStore.updateTechnicianSettings({ preferredContactMethod: method })
    showToast('Preferred contact method updated')
  }

  // Job Type toggle
  const handleToggleJobType = (jobType: string) => {
    const current = settings.preferredJobTypes
    const updated = current.includes(jobType)
      ? current.filter((t) => t !== jobType)
      : [...current, jobType]
    mockStore.updateTechnicianSettings({ preferredJobTypes: updated })
    showToast('Job preferences updated')
  }

  // Distance updater
  const handleDistanceChange = (distance: number) => {
    mockStore.updateTechnicianSettings({ preferredMaxJobDistanceKm: distance })
    showToast('Preferred distance updated')
  }

  // Generic toggle
  const handleToggleSetting = (key: 'notifyOutsidePreferredHours' | 'jobAssignmentNotifications') => {
    const nextVal = !settings[key]
    mockStore.updateTechnicianSettings({ [key]: nextVal })
    showToast('Preference updated')
  }

  // Reset preferences
  const handleResetPreferences = () => {
    mockStore.resetTechnicianSettings()
    setResetModalOpen(false)
    showToast('Preferences restored to default')
  }

  // Handle password change submit
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!currentPassword) {
      errors.current = 'Current password is required.'
    }
    if (!newPassword) {
      errors.new = 'New password is required.'
    } else if (newPassword.length < 8) {
      errors.new = 'Password must contain at least 8 characters.'
    } else if (newPassword === currentPassword) {
      errors.new = 'New password must be different from your current password.'
    }
    if (!confirmPassword) {
      errors.confirm = 'Please confirm your new password.'
    } else if (confirmPassword !== newPassword) {
      errors.confirm = 'Passwords do not match.'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setPasswordErrors({})
    setPasswordSuccess(true)
    setTimeout(() => {
      setPasswordSuccess(false)
      setPasswordModalOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated successfully')
    }, 1200)
  }

  // Account status helpers
  const isApproved = app?.status === 'approved' || profile.status === 'approved'
  const professionalStatusLabel = isApproved
    ? 'Approved'
    : app?.status === 'rejected'
    ? 'Rejected'
    : app?.status === 'changes_requested'
    ? 'Changes Requested'
    : app?.status === 'pending_review'
    ? 'Pending Admin Review'
    : app?.status === 'approved_for_assessment' || app?.status === 'assessment_scheduled' || app?.status === 'assessment_passed' || app?.status === 'assessment_failed'
    ? 'In Assessment'
    : 'Profile Pending'

  const jobEligibilityLabel = isApproved ? 'Eligible for Jobs' : 'Not Yet Eligible'

  return (
    <div className="technician-settings-page">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="settings-toast-banner" role="status">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* Page Heading */}
      <section className="technician-profile-heading settings-heading">
        <div>
          <span className="section-kicker">SETTINGS</span>
          <h1>Technician Settings</h1>
          <p>Manage your account, notifications, communication preferences, and security.</p>
        </div>
        <div className="settings-header-actions">
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={() => setResetModalOpen(true)}
          >
            <RotateCcw size={15} /> Reset Preferences
          </button>
        </div>
      </section>

      <div className="settings-panels-grid">
        {/* 1. NOTIFICATIONS */}
        <section className="technician-panel settings-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge blue">
                <Bell size={18} />
              </span>
              <div>
                <h2>Notifications</h2>
                <p>Choose which updates and operational alerts you want to receive.</p>
              </div>
            </div>
          </div>

          <div className="settings-items-list">
            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>New Job Assignments</strong>
                <small>Receive immediate alerts when a new customer ticket is assigned to you.</small>
              </div>
              <button
                className={settings.notifications.newJobAssignments ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.newJobAssignments}
                aria-label="New Job Assignments"
                onClick={() => handleToggleNotification('newJobAssignments')}
              >
                <span />
              </button>
            </div>

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Job Status Updates</strong>
                <small>Get notified when customer details, appointment times, or ticket statuses change.</small>
              </div>
              <button
                className={settings.notifications.jobStatusUpdates ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.jobStatusUpdates}
                aria-label="Job Status Updates"
                onClick={() => handleToggleNotification('jobStatusUpdates')}
              >
                <span />
              </button>
            </div>

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Assessment Updates</strong>
                <small>Alerts regarding assessment scheduling, venue instructions, and practical results.</small>
              </div>
              <button
                className={settings.notifications.assessmentUpdates ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.assessmentUpdates}
                aria-label="Assessment Updates"
                onClick={() => handleToggleNotification('assessmentUpdates')}
              >
                <span />
              </button>
            </div>

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Application Updates</strong>
                <small>Status notices about application review, change requests, and approval milestones.</small>
              </div>
              <button
                className={settings.notifications.applicationUpdates ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.applicationUpdates}
                aria-label="Application Updates"
                onClick={() => handleToggleNotification('applicationUpdates')}
              >
                <span />
              </button>
            </div>

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Admin Messages</strong>
                <small>Direct instructions, dispatch notes, and messages from platform administrators.</small>
              </div>
              <button
                className={settings.notifications.adminMessages ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.adminMessages}
                aria-label="Admin Messages"
                onClick={() => handleToggleNotification('adminMessages')}
              >
                <span />
              </button>
            </div>

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Repair Reminders</strong>
                <small>Upcoming on-site repair appointment reminders and checklist notifications.</small>
              </div>
              <button
                className={settings.notifications.repairReminders ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.repairReminders}
                aria-label="Repair Reminders"
                onClick={() => handleToggleNotification('repairReminders')}
              >
                <span />
              </button>
            </div>

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>System Notifications</strong>
                <small>Platform announcements, policy updates, and scheduled maintenance notices.</small>
              </div>
              <button
                className={settings.notifications.systemNotifications ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifications.systemNotifications}
                aria-label="System Notifications"
                onClick={() => handleToggleNotification('systemNotifications')}
              >
                <span />
              </button>
            </div>
          </div>
        </section>

        {/* 2. LANGUAGE & COMMUNICATION */}
        <section className="technician-panel settings-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge purple">
                <Globe size={18} />
              </span>
              <div>
                <h2>Language & Communication</h2>
                <p>Choose your portal interface language and preferred dispatch contact channel.</p>
              </div>
            </div>
          </div>

          <div className="settings-form-block">
            <div className="settings-control-row">
              <div className="control-label-wrap">
                <label htmlFor="app-language-select">
                  <strong>App Language</strong>
                </label>
                <small>
                  Controls the Technician Portal interface language. This does not modify your customer communication languages in Profile.
                </small>
              </div>
              <select
                id="app-language-select"
                className="settings-select"
                value={settings.appLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as TechnicianSettings['appLanguage'])}
              >
                <option value="en">English (English)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div className="settings-divider" />

            <div className="settings-control-row stacked">
              <div className="control-label-wrap">
                <strong>Preferred Contact Method</strong>
                <small>Used for dispatch coordination, critical job alerts, and operational outreach.</small>
              </div>
              <div className="contact-methods-grid" role="radiogroup" aria-label="Preferred Contact Method">
                {[
                  { id: 'phone', label: 'Phone Call', icon: Smartphone, desc: 'Immediate voice call for urgent assignments' },
                  { id: 'sms', label: 'SMS Text', icon: MessageSquare, desc: 'Text messages with ticket links and OTPs' },
                  { id: 'email', label: 'Email', icon: Radio, desc: 'Detailed summaries and daily schedules' },
                ].map((method) => {
                  const Icon = method.icon
                  const isSelected = settings.preferredContactMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={isSelected ? 'contact-method-card selected' : 'contact-method-card'}
                      onClick={() => handleContactMethodChange(method.id as TechnicianSettings['preferredContactMethod'])}
                    >
                      <div className="radio-indicator">
                        <span className={isSelected ? 'dot on' : 'dot'} />
                      </div>
                      <Icon size={18} className="method-icon" />
                      <div>
                        <strong>{method.label}</strong>
                        <small>{method.desc}</small>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRIVACY & SECURITY */}
        <section className="technician-panel settings-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge green">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h2>Privacy & Security</h2>
                <p>Manage your account password, active login sessions, and authentication security.</p>
              </div>
            </div>
          </div>

          <div className="security-actions-list">
            <div className="security-action-row">
              <div className="security-info">
                <span className="security-icon-circle">
                  <KeyRound size={17} />
                </span>
                <div>
                  <strong>Change Password</strong>
                  <small>Update your account password regularly to keep your technician portal secure.</small>
                </div>
              </div>
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => {
                  setPasswordErrors({})
                  setPasswordSuccess(false)
                  setPasswordModalOpen(true)
                }}
              >
                Change Password →
              </button>
            </div>

            <div className="security-action-row">
              <div className="security-info">
                <span className="security-icon-circle">
                  <Laptop size={17} />
                </span>
                <div>
                  <strong>Login Sessions</strong>
                  <small>Review device details and sessions currently signed in to your technician account.</small>
                </div>
              </div>
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => setSessionsModalOpen(true)}
              >
                Manage Sessions →
              </button>
            </div>

            <div className="security-action-row">
              <div className="security-info">
                <span className="security-icon-circle">
                  <Lock size={17} />
                </span>
                <div>
                  <strong>Two-Factor Authentication (2FA)</strong>
                  <small>Add an extra layer of protection to safeguard your technician credentials.</small>
                </div>
              </div>
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => setTwoFaModalOpen(true)}
              >
                Configure →
              </button>
            </div>
          </div>
        </section>

        {/* 4. JOB PREFERENCES */}
        <section className="technician-panel settings-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge amber">
                <Wrench size={18} />
              </span>
              <div>
                <h2>Job Preferences</h2>
                <p>Set your preferred service categories and travel radius preferences.</p>
              </div>
            </div>
          </div>

          <div className="settings-form-block">
            <div className="settings-control-row stacked">
              <div className="control-label-wrap">
                <strong>Preferred Job Types</strong>
                <small>
                  Indicate types of work you prefer. These preferences guide matching and do not override your verified Specializations.
                </small>
              </div>
              <div className="job-types-selection-grid">
                {['Installation', 'Repair', 'Maintenance', 'Troubleshooting'].map((jobType) => {
                  const isChecked = settings.preferredJobTypes.includes(jobType)
                  return (
                    <button
                      key={jobType}
                      type="button"
                      className={isChecked ? 'job-type-pill selected' : 'job-type-pill'}
                      aria-pressed={isChecked}
                      onClick={() => handleToggleJobType(jobType)}
                    >
                      <span className="checkbox-box">{isChecked && <Check size={12} />}</span>
                      {jobType}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-control-row">
              <div className="control-label-wrap">
                <label htmlFor="max-distance-select">
                  <strong>Preferred Maximum Job Distance</strong>
                </label>
                <small>
                  Preferred travel distance for dispatch matching. Registered service radius in Profile remains {profile.serviceRadiusKm || 25} km.
                </small>
              </div>
              <select
                id="max-distance-select"
                className="settings-select"
                value={settings.preferredMaxJobDistanceKm}
                onChange={(e) => handleDistanceChange(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30, 50].map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} km
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-divider" />

            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Job Assignment Notifications</strong>
                <small>Receive push and app alerts as soon as a new customer ticket is matched to you.</small>
              </div>
              <button
                className={settings.jobAssignmentNotifications ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.jobAssignmentNotifications}
                aria-label="Job Assignment Notifications"
                onClick={() => handleToggleSetting('jobAssignmentNotifications')}
              >
                <span />
              </button>
            </div>
          </div>
        </section>

        {/* 5. AVAILABILITY PREFERENCES */}
        <section className="technician-panel settings-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge blue">
                <Sliders size={18} />
              </span>
              <div>
                <h2>Availability Preferences</h2>
                <p>Configure notification rules for emergency or after-hours service calls.</p>
              </div>
            </div>
          </div>

          <div className="settings-items-list">
            <div className="settings-toggle-item">
              <div className="toggle-text">
                <strong>Receive Job Notifications Outside Preferred Hours</strong>
                <small>
                  Allow notifications for urgent or emergency jobs outside your official working hours ({profile.workingHours?.start || '09:00'} - {profile.workingHours?.end || '18:00'}). Official working days and hours in your Profile remain unchanged.
                </small>
              </div>
              <button
                className={settings.notifyOutsidePreferredHours ? 'toggle on' : 'toggle'}
                type="button"
                role="switch"
                aria-checked={settings.notifyOutsidePreferredHours}
                aria-label="Receive Job Notifications Outside Preferred Hours"
                onClick={() => handleToggleSetting('notifyOutsidePreferredHours')}
              >
                <span />
              </button>
            </div>
          </div>
        </section>

        {/* 6. ACCOUNT OVERVIEW */}
        <section className="technician-panel settings-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge green">
                <UserCheck size={18} />
              </span>
              <div>
                <h2>Account Overview</h2>
                <p>Read-only overview of your credentials and platform verification status.</p>
              </div>
            </div>
          </div>

          <div className="account-overview-grid">
            <div className="account-status-card">
              <small>Account Status</small>
              <span className="status-pill success">
                <Check size={12} /> Active
              </span>
              <p>Technician account is active and verified.</p>
            </div>

            <div className="account-status-card">
              <small>Professional Status</small>
              <span className={`status-pill ${isApproved ? 'success' : app?.status === 'rejected' ? 'danger' : 'warning'}`}>
                {isApproved && <Check size={12} />}
                {professionalStatusLabel}
              </span>
              <p>Managed via the admin verification workflow.</p>
            </div>

            <div className="account-status-card">
              <small>Job Eligibility</small>
              <span className={`status-pill ${isApproved ? 'success' : 'warning'}`}>
                {isApproved && <Check size={12} />}
                {jobEligibilityLabel}
              </span>
              <p>{isApproved ? 'Eligible to receive customer service jobs.' : 'Complete assessment & admin approval to unlock jobs.'}</p>
            </div>
          </div>

          <div className="account-actions-row">
            <button
              type="button"
              className="secondary-button logout-trigger-btn"
              onClick={() => setLogoutModalOpen(true)}
            >
              <LogOut size={16} /> Log Out of Technician Portal
            </button>
          </div>
        </section>

        {/* 7. DANGER ZONE */}
        <section className="technician-panel settings-panel danger-panel">
          <div className="settings-panel-header">
            <div className="panel-title-wrap">
              <span className="settings-icon-badge danger">
                <ShieldAlert size={18} />
              </span>
              <div>
                <h2 className="danger-text">Danger Zone</h2>
                <p>Permanent account actions and profile deletion.</p>
              </div>
            </div>
          </div>

          <div className="danger-zone-content">
            <div className="danger-info">
              <strong>Delete Account</strong>
              <small>
                Deleting your account is permanent and may remove access to your technician profile, applications, certifications, and job history.
              </small>
            </div>
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                setDeleteConfirmText('')
                setDeleteModalOpen(true)
              }}
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* 1. Change Password Modal */}
      {passwordModalOpen && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="pwd-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setPasswordModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon-header">
              <KeyRound size={22} className="modal-header-icon" />
              <div>
                <h2 id="pwd-modal-title">Change Password</h2>
                <p>Enter your current password and choose a secure new password (min. 8 characters).</p>
              </div>
            </div>

            {passwordSuccess ? (
              <div className="technician-success modal-success" role="status">
                <Check size={18} /> Password changed successfully!
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="password-form-grid">
                <div className="technician-field">
                  <label htmlFor="current-pwd">Current Password *</label>
                  <div className="password-wrap">
                    <input
                      id="current-pwd"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={showCurrent ? 'Hide password' : 'Show password'}
                      onClick={() => setShowCurrent(!showCurrent)}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.current && <small className="tech-error">{passwordErrors.current}</small>}
                </div>

                <div className="technician-field">
                  <label htmlFor="new-pwd">New Password *</label>
                  <div className="password-wrap">
                    <input
                      id="new-pwd"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.new && <small className="tech-error">{passwordErrors.new}</small>}
                </div>

                <div className="technician-field">
                  <label htmlFor="confirm-pwd">Confirm New Password *</label>
                  <div className="password-wrap">
                    <input
                      id="confirm-pwd"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                    />
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.confirm && <small className="tech-error">{passwordErrors.confirm}</small>}
                </div>

                <div className="modal-actions">
                  <button className="secondary-button" type="button" onClick={() => setPasswordModalOpen(false)}>
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {/* 2. Login Sessions Modal */}
      {sessionsModalOpen && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="sessions-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setSessionsModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon-header">
              <Laptop size={22} className="modal-header-icon" />
              <div>
                <h2 id="sessions-modal-title">Login Sessions</h2>
                <p>Review signed-in devices connected to your technician account.</p>
              </div>
            </div>

            <div className="sessions-list">
              <div className="session-card current">
                <div className="session-device-icon">
                  <Laptop size={20} />
                </div>
                <div className="session-details">
                  <div className="session-title-row">
                    <strong>Windows / Chrome (This Device)</strong>
                    <span className="status-pill success small">Active Now</span>
                  </div>
                  <small>Chennai, Tamil Nadu, India • Current session</small>
                </div>
              </div>
            </div>

            <div className="modal-info-note">
              <Shield size={16} />
              <span>Multi-device session management and remote revocation will be available in an upcoming release.</span>
            </div>

            <div className="modal-actions">
              <button className="primary-button" type="button" onClick={() => setSessionsModalOpen(false)}>
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 3. Two-Factor Authentication Modal */}
      {twoFaModalOpen && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="twofa-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setTwoFaModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon-header">
              <Lock size={22} className="modal-header-icon" />
              <div>
                <h2 id="twofa-modal-title">Two-Factor Authentication</h2>
                <p>Enhance account protection using authenticator apps or SMS codes.</p>
              </div>
            </div>

            <div className="twofa-status-box">
              <div className="status-row">
                <span>Current Status:</span>
                <span className="status-pill warning">Not Enabled</span>
              </div>
              <p>Two-factor authentication (2FA) for technician accounts is currently in development and will be available in a future update.</p>
            </div>

            <div className="modal-info-note">
              <ShieldCheck size={16} />
              <span>
                <strong>Note:</strong> The 6-digit customer arrival OTP used during on-site job repair is separate from account security 2FA.
              </span>
            </div>

            <div className="modal-actions">
              <button className="primary-button" type="button" onClick={() => setTwoFaModalOpen(false)}>
                Got it
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 4. Reset Preferences Modal */}
      {resetModalOpen && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setResetModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon-header">
              <RotateCcw size={22} className="modal-header-icon" />
              <div>
                <h2 id="reset-modal-title">Reset Preferences?</h2>
                <p>Restore your notification and job preferences to platform defaults.</p>
              </div>
            </div>

            <div className="modal-warning-box">
              <AlertTriangle size={17} />
              <span>
                This action will reset your notification toggles, language, and job preferences. Your verified profile, specializations, certifications, and application status will <strong>NOT</strong> be changed.
              </span>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setResetModalOpen(false)}>
                Cancel
              </button>
              <button className="primary-button" type="button" onClick={handleResetPreferences}>
                Reset Preferences
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 5. Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setLogoutModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon-header">
              <LogOut size={22} className="modal-header-icon danger-text" />
              <div>
                <h2 id="logout-modal-title">Log out?</h2>
                <p>Are you sure you want to log out of your technician account?</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setLogoutModalOpen(false)}>
                Cancel
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => navigate('/login')}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 6. Delete Account Modal */}
      {deleteModalOpen && (
        <div className="ticket-modal-backdrop">
          <section className="ticket-modal settings-modal danger-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setDeleteModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-icon-header">
              <Trash2 size={22} className="modal-header-icon danger-text" />
              <div>
                <h2 id="delete-modal-title" className="danger-text">Delete your account?</h2>
                <p>This action is irreversible and will permanently close your technician profile.</p>
              </div>
            </div>

            <div className="modal-warning-box danger">
              <AlertTriangle size={17} />
              <span>
                <strong>Notice:</strong> Direct account deletion is not available in the current MVP release. Please contact support or platform administration for account closure requests.
              </span>
            </div>

            <div className="technician-field" style={{ marginTop: '14px' }}>
              <label htmlFor="delete-confirm-input">Type <strong>DELETE</strong> to confirm:</label>
              <input
                id="delete-confirm-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button
                className="danger-button"
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={() => {
                  showToast('Account deletion is not available in current MVP')
                  setDeleteModalOpen(false)
                }}
              >
                Delete Account (Disabled)
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
