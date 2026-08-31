import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  LogOut,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Wrench,
  X,
  XCircle,
} from 'lucide-react'
import { useMockStore, mockStore } from '../../services/mockStore'
import { registeredCustomers, type CustomerProfile } from '../../mocks/customerData'
import type { AssessmentDetails } from '../../types/technicianPortal'

type AdminTab = 'applications' | 'assessments' | 'approvals' | 'approved_technicians' | 'customers' | 'settings'

export function AdminPortal({ defaultTab = 'applications' }: { defaultTab?: AdminTab }) {
  const state = useMockStore()
  const [currentTab, setCurrentTab] = useState<AdminTab>(defaultTab)

  // Modals / subview state
  const [viewingApplication, setViewingApplication] = useState(false)
  const [changeNoteModalOpen, setChangeNoteModalOpen] = useState(false)
  const [changeNote, setChangeNote] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Assessment Assignment Form state
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedCenterId, setSelectedCenterId] = useState(state.assessmentCenters[0]?.id || '')
  const [selectedSpec, setSelectedSpec] = useState(state.technicianProfile.specializations[0] || 'Smart Home Installation')
  const [assessmentDate, setAssessmentDate] = useState('2026-09-02')
  const [assessmentTime, setAssessmentTime] = useState('10:00 AM')
  const [instructions, setInstructions] = useState('Bring required hand tools, multimeter, and arrive 15 minutes early.')

  // Practical Assessment Grading state
  const [evalScore, setEvalScore] = useState('88')
  const [evalNotes, setEvalNotes] = useState('Demonstrated good grasp of electrical safety protocols, proper conduit wiring, and accurate sensor pairing.')

  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)
  const [adminProfile, setAdminProfile] = useState({
    name: 'Lead Administrator',
    email: 'admin@smartassist.ai',
    mobile: '+91 98765 43210',
    role: 'Lead Administrator',
  })
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileForm, setProfileForm] = useState(adminProfile)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileToast, setProfileToast] = useState('')
  const [portalSettings, setPortalSettings] = useState({
    portalName: 'SmartAssist Admin',
    supportEmail: 'support@smartassist.ai',
    supportPhone: '+91 44 3954 2020',
  })
  const [portalToast, setPortalToast] = useState('')
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordToast, setPasswordToast] = useState('')

  const profile = state.technicianProfile
  const app = state.application
  const currentCenter = state.assessmentCenters.find((c) => c.id === selectedCenterId) || state.assessmentCenters[0]
  const filteredCustomers = registeredCustomers.filter((customer) => {
    const query = customerSearch.trim().toLowerCase()
    if (!query) return true
    return [customer.name, customer.email, customer.mobile, customer.city]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const handleRequestChanges = (e: FormEvent) => {
    e.preventDefault()
    if (!changeNote.trim()) return
    mockStore.requestChanges(changeNote)
    setChangeNoteModalOpen(false)
    setViewingApplication(false)
  }

  const handleReject = (e: FormEvent) => {
    e.preventDefault()
    if (!rejectionReason.trim()) return
    mockStore.rejectApplication(rejectionReason)
    setRejectModalOpen(false)
    setViewingApplication(false)
  }

  const handleApproveForAssessment = () => {
    mockStore.approveForAssessment()
    setViewingApplication(false)
    setAssignModalOpen(true)
    setCurrentTab('assessments')
  }

  const handleAssignAssessmentSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!currentCenter) return
    const details: Omit<AssessmentDetails, 'scheduledAt'> = {
      centerId: currentCenter.id,
      centerName: currentCenter.name,
      address: `${currentCenter.address}, ${currentCenter.city}`,
      specialization: selectedSpec,
      date: assessmentDate,
      time: assessmentTime,
      instructions: instructions || 'Bring required tools and arrive 15 minutes early.',
    }
    mockStore.assignAssessment(details)
    setAssignModalOpen(false)
  }

  const handleGradeAssessment = (result: 'pass' | 'fail') => {
    const scoreNum = Number.parseInt(evalScore, 10) || 0
    mockStore.recordAssessmentResult(scoreNum, evalNotes, result)
    if (result === 'pass') {
      setCurrentTab('approvals')
    }
  }

  const handleFinalApprove = () => {
    mockStore.finalApproveTechnician()
    setCurrentTab('approved_technicians')
  }

  const validateAdminProfile = () => {
    const nextErrors: Record<string, string> = {}
    if (!profileForm.name.trim()) nextErrors.name = 'Name cannot be empty.'
    if (!/^\S+@\S+\.\S+$/.test(profileForm.email)) nextErrors.email = 'Email must be valid.'
    if (!/^\+?[0-9\s-]{10,15}$/.test(profileForm.mobile.trim())) nextErrors.mobile = 'Mobile number is invalid.'
    setProfileErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault()
    if (!validateAdminProfile()) return
    setAdminProfile({ ...profileForm })
    setProfileModalOpen(false)
    setProfileToast('Profile updated successfully.')
    setProfileErrors({})
  }

  const handlePortalSettingsSave = (e: FormEvent) => {
    e.preventDefault()
    setPortalToast('Portal settings updated successfully.')
  }

  const validatePasswordChange = () => {
    const nextErrors: Record<string, string> = {}
    if (!passwordForm.currentPassword.trim()) nextErrors.currentPassword = 'Current password is required.'
    if (passwordForm.newPassword.length < 8) nextErrors.newPassword = 'New password must contain at least 8 characters.'
    if (passwordForm.confirmPassword !== passwordForm.newPassword) nextErrors.confirmPassword = 'Confirm password must match the new password.'
    setPasswordErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault()
    if (!validatePasswordChange()) return
    setPasswordModalOpen(false)
    setPasswordToast('Password changed successfully.')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordErrors({})
  }

  return (
    <div className="customer-app admin-portal-wrapper">
      {/* Admin Sidebar */}
      <aside className="customer-sidebar admin-sidebar">
        <div className="customer-brand">
          <span className="brand-mark admin-brand-mark">
            <ShieldCheck size={18} />
          </span>
          <span>
            <strong>SmartAssist Admin</strong>
            <small>Operations Portal</small>
          </span>
        </div>

        <nav aria-label="Admin navigation">
          <button
            type="button"
            className={currentTab === 'applications' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('applications')}
          >
            <Users size={18} />
            Applications
            {app?.status === 'pending_review' && <span className="nav-count">1</span>}
          </button>

          <button
            type="button"
            className={currentTab === 'assessments' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('assessments')}
          >
            <Calendar size={18} />
            Assessments
            {app?.status === 'approved_for_assessment' && <span className="nav-count warning">!</span>}
          </button>

          <button
            type="button"
            className={currentTab === 'approvals' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('approvals')}
          >
            <UserCheck size={18} />
            Final Approvals
            {app?.status === 'assessment_passed' && <span className="nav-count success">1</span>}
          </button>

          <button
            type="button"
            className={currentTab === 'approved_technicians' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('approved_technicians')}
          >
            <Award size={18} />
            Approved Technicians
            {app?.status === 'approved' && <span className="nav-count success">1</span>}
          </button>

          <button
            type="button"
            className={currentTab === 'customers' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('customers')}
          >
            <Users size={18} />
            Customers
          </button>

          <button
            type="button"
            className={currentTab === 'settings' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('settings')}
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-user">
          <span className="avatar admin-avatar">AD</span>
          <span>
            <strong>Lead Administrator</strong>
            <small>admin@smartassist.ai</small>
          </span>
        </div>

        <Link className="logout-link" to="/login">
          <LogOut size={16} /> Log out
        </Link>
      </aside>

      {/* Admin Main Content */}
      <div className="customer-main admin-main">
        <header className="customer-header">
          <div>
            <span className="header-kicker">ADMINISTRATION & VERIFICATION</span>
            <h1>
              {currentTab === 'applications' && 'Technician Applications'}
              {currentTab === 'assessments' && 'Practical Assessment Assignment & Evaluation'}
              {currentTab === 'approvals' && 'Final Technician Approval'}
              {currentTab === 'approved_technicians' && 'Approved Technicians'}
              {currentTab === 'customers' && 'Customers'}
              {currentTab === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="header-actions">
          </div>
        </header>

        <div className="customer-content">
          {/* TAB 1: APPLICATIONS (STEP 6) */}
          {currentTab === 'applications' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <ShieldCheck size={20} />
                <div>
                  <strong>Technician Verification Workflow</strong>
                  <p>
                    Review submitted technician profiles. Approving at this stage authorizes the technician for practical evaluation at an assessment center.
                  </p>
                </div>
              </div>

              <section className="content-panel admin-table-panel">
                <div className="panel-header-row">
                  <h3>Submitted Applications</h3>
                  <span className="status-count-badge">
                    {app ? (app.status === 'pending_review' ? '1 Pending' : app.status) : 'No submissions yet'}
                  </span>
                </div>

                {!app ? (
                  <div className="admin-empty-state">
                    <UserRound size={36} />
                    <h4>No applications submitted yet</h4>
                    <p>
                      The technician must first complete their profile and click <strong>Submit Application</strong> in the Technician Portal.
                    </p>
                    <button
                      type="button"
                      className="primary-button compact-button"
                      onClick={() => {
                        mockStore.submitApplication()
                      }}
                    >
                      Simulate Profile Submission
                    </button>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Technician Name</th>
                          <th>Specialization</th>
                          <th>Experience</th>
                          <th>Languages</th>
                          <th>Service Area</th>
                          <th>Application Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <strong>{profile.name}</strong>
                            <small className="table-subtext">{profile.email}</small>
                          </td>
                          <td>
                            <span className="specialization-tag">
                              {profile.specializations.join(', ') || profile.specialization || 'Not specified'}
                            </span>
                          </td>
                          <td>{profile.experience ? `${profile.experience} years` : '1 year'}</td>
                          <td>{profile.languages.join(', ')}</td>
                          <td>{profile.serviceArea || profile.city}</td>
                          <td>{app.submittedAt}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                app.status === 'pending_review'
                                  ? 'warning'
                                  : app.status === 'approved_for_assessment' || app.status === 'assessment_scheduled' || app.status === 'approved'
                                  ? 'success'
                                  : app.status === 'changes_requested'
                                  ? 'info'
                                  : 'danger'
                              }`}
                            >
                              {app.status === 'pending_review' && 'Pending Review'}
                              {app.status === 'changes_requested' && 'Changes Requested'}
                              {app.status === 'rejected' && 'Rejected'}
                              {app.status === 'approved_for_assessment' && 'Approved for Assessment'}
                              {app.status === 'assessment_scheduled' && 'Assessment Scheduled'}
                              {app.status === 'assessment_passed' && 'Assessment Passed'}
                              {app.status === 'assessment_failed' && 'Assessment Failed'}
                              {app.status === 'approved' && 'Approved'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="outline-button compact-button"
                              onClick={() => setViewingApplication(true)}
                            >
                              <Eye size={14} /> View Application
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: ASSESSMENTS (STEPS 7 & 8) */}
          {currentTab === 'assessments' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <Calendar size={20} />
                <div>
                  <strong>Steps 7 & 8: Practical Assessment Management</strong>
                  <p>
                    Assign a physical evaluation center and evaluate technician competency with on-site practical grading.
                  </p>
                </div>
              </div>

              <div className="admin-grid-two">
                {/* Step 7: Assignment Card */}
                <section className="content-panel">
                  <div className="panel-header-row">
                    <h3>Step 7: Assign Assessment Center</h3>
                    <span className="step-tag">Step 7</span>
                  </div>

                  {!app || (app.status !== 'approved_for_assessment' && !app.assessment) ? (
                    <div className="admin-empty-state-card">
                      <Clock size={28} />
                      <p>
                        Technician application must first be approved for assessment in Step 6.
                      </p>
                      {app?.status === 'pending_review' && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            mockStore.approveForAssessment()
                          }}
                        >
                          Approve Application for Assessment
                        </button>
                      )}
                    </div>
                  ) : app.assessment ? (
                    <div className="assigned-details-box">
                      <div className="assigned-header">
                        <CheckCircle2 size={20} className="success-icon" />
                        <div>
                          <strong>Assessment Scheduled</strong>
                          <p>Details assigned to {profile.name}</p>
                        </div>
                      </div>
                      <div className="review-grid">
                        <div className="review-item">
                          <span>Assessment Center</span>
                          <strong>{app.assessment.centerName}</strong>
                        </div>
                        <div className="review-item">
                          <span>Center Address</span>
                          <strong>{app.assessment.address}</strong>
                        </div>
                        <div className="review-item">
                          <span>Specialization</span>
                          <strong>{app.assessment.specialization}</strong>
                        </div>
                        <div className="review-item">
                          <span>Scheduled Date & Time</span>
                          <strong>{app.assessment.date} at {app.assessment.time}</strong>
                        </div>
                        <div className="review-item full-width">
                          <span>Technician Instructions</span>
                          <p className="instruction-text">{app.assessment.instructions}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="outline-button"
                        onClick={() => setAssignModalOpen(true)}
                      >
                        Reschedule / Change Center
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="section-note">
                        Technician is approved for assessment. Assign a verified center and date:
                      </p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => setAssignModalOpen(true)}
                      >
                        <Calendar size={16} /> Assign Assessment Center
                      </button>
                    </div>
                  )}
                </section>

                {/* Step 8: Grading Card */}
                <section className="content-panel">
                  <div className="panel-header-row">
                    <h3>Step 8: Practical Evaluation Result</h3>
                    <span className="step-tag">Step 8</span>
                  </div>

                  {!app?.assessment ? (
                    <div className="admin-empty-state-card">
                      <Wrench size={28} />
                      <p>Assessment must be scheduled before recording on-site results.</p>
                    </div>
                  ) : app.assessment.result ? (
                    <div className="evaluation-result-box">
                      <span className={`result-badge ${app.assessment.result === 'pass' ? 'pass' : 'fail'}`}>
                        {app.assessment.result === 'pass' ? '✓ Assessment Passed' : '✕ Assessment Failed'}
                      </span>
                      <div className="review-grid">
                        <div className="review-item">
                          <span>Practical Score</span>
                          <strong>{app.assessment.score} / 100</strong>
                        </div>
                        <div className="review-item">
                          <span>Result Status</span>
                          <strong className={app.assessment.result === 'pass' ? 'success-text' : 'danger-text'}>
                            {app.assessment.result === 'pass' ? 'PASS' : 'FAIL (Reassessment Required)'}
                          </strong>
                        </div>
                        <div className="review-item full-width">
                          <span>Evaluator Notes</span>
                          <p className="evaluator-note-text">{app.assessment.evaluatorNotes}</p>
                        </div>
                      </div>

                      {app.assessment.result === 'fail' ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => setAssignModalOpen(true)}
                        >
                          <RotateCcw size={15} /> Schedule Reassessment
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => setCurrentTab('approvals')}
                        >
                          Proceed to Final Approval (Step 9)
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grading-form-wrapper">
                      <div className="candidate-card">
                        <span>Candidate: <strong>{profile.name}</strong></span>
                        <span>Track: <strong>{app.assessment.specialization}</strong></span>
                      </div>

                      <div className="technician-field">
                        <label htmlFor="eval-score">Practical Evaluation Score (0 - 100) *</label>
                        <input
                          id="eval-score"
                          type="number"
                          min="0"
                          max="100"
                          value={evalScore}
                          onChange={(e) => setEvalScore(e.target.value)}
                        />
                      </div>

                      <div className="technician-field">
                        <label htmlFor="eval-notes">Evaluator Assessment Notes *</label>
                        <textarea
                          id="eval-notes"
                          className="experience-summary"
                          rows={3}
                          value={evalNotes}
                          onChange={(e) => setEvalNotes(e.target.value)}
                          placeholder="Provide detailed feedback on wiring, tool handling, diagnostic speed, safety protocols..."
                        />
                      </div>

                      <div className="grade-actions">
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleGradeAssessment('fail')}
                        >
                          <XCircle size={16} /> Mark as Fail
                        </button>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleGradeAssessment('pass')}
                        >
                          <CheckCircle2 size={16} /> Mark as Pass
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* TAB 3: FINAL APPROVALS (STEP 9) */}
          {currentTab === 'approvals' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <Award size={20} />
                <div>
                  <strong>Step 9: Final Admin Review & Job Eligibility</strong>
                  <p>
                    Once the technician passes practical assessment, the Administrator gives final authorization. Only approved technicians receive customer service tickets.
                  </p>
                </div>
              </div>

              <section className="content-panel">
                <div className="panel-header-row">
                  <h3>Technician Approval Dossier</h3>
                  <span className={`status-pill ${app?.status === 'approved' ? 'success' : 'warning'}`}>
                    {app?.status === 'approved' ? 'APPROVED & ELIGIBLE FOR JOBS' : 'PENDING FINAL APPROVAL'}
                  </span>
                </div>

                {app?.status === 'approved' ? (
                  <div className="approved-success-banner">
                    <CheckCircle2 size={32} />
                    <div>
                      <h3>Technician Fully Approved</h3>
                      <p>
                        <strong>{profile.name}</strong> is now verified, certified, and eligible for customer service ticket assignments.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setCurrentTab('approved_technicians')}
                    >
                      View Approved Technicians
                    </button>
                  </div>
                ) : app?.status !== 'assessment_passed' ? (
                  <div className="admin-empty-state">
                    <AlertTriangle size={32} />
                    <h4>Assessment Not Passed Yet</h4>
                    <p>
                      The candidate must complete and pass the practical evaluation in Step 8 before final approval can be granted.
                    </p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setCurrentTab('assessments')}
                    >
                      Go to Assessments
                    </button>
                  </div>
                ) : (
                  <div className="final-review-dossier">
                    <div className="dossier-grid">
                      <div className="dossier-card">
                        <h4>1. Candidate Profile</h4>
                        <div className="review-grid">
                          <div className="review-item">
                            <span>Name</span>
                            <strong>{profile.name}</strong>
                          </div>
                          <div className="review-item">
                            <span>Mobile</span>
                            <strong>{profile.mobile}</strong>
                          </div>
                          <div className="review-item">
                            <span>Experience</span>
                            <strong>{profile.experience} years</strong>
                          </div>
                          <div className="review-item">
                            <span>Languages</span>
                            <strong>{profile.languages.join(', ')}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="dossier-card">
                        <h4>2. Technical Capabilities</h4>
                        <div className="review-grid">
                          <div className="review-item">
                            <span>Specializations</span>
                            <strong>{profile.specializations.join(', ')}</strong>
                          </div>
                          <div className="review-item">
                            <span>Skills</span>
                            <strong>{profile.skills.join(', ')}</strong>
                          </div>
                          <div className="review-item">
                            <span>Service Area</span>
                            <strong>{profile.city}, {profile.state} (Radius {profile.serviceRadiusKm} km)</strong>
                          </div>
                          <div className="review-item">
                            <span>Availability</span>
                            <strong>{profile.workingDays.join(', ')} ({profile.workingHours?.start} - {profile.workingHours?.end})</strong>
                          </div>
                        </div>
                      </div>

                      <div className="dossier-card full-span highlight-card">
                        <h4>3. Practical Assessment Evaluation</h4>
                        <div className="review-grid">
                          <div className="review-item">
                            <span>Assessment Center</span>
                            <strong>{app.assessment?.centerName}</strong>
                          </div>
                          <div className="review-item">
                            <span>Practical Score</span>
                            <strong className="success-text">{app.assessment?.score} / 100 (PASSED)</strong>
                          </div>
                          <div className="review-item full-width">
                            <span>Evaluator Feedback</span>
                            <p>{app.assessment?.evaluatorNotes}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dossier-actions">
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => {
                          mockStore.rejectApplication('Failed final administrative review.')
                          setCurrentTab('applications')
                        }}
                      >
                        <X size={16} /> Reject Application
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={handleFinalApprove}
                      >
                        <Check size={16} /> Approve Technician (Make Eligible for Jobs)
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 4: TICKETS & JOB ASSIGNMENT (STEP 10) */}
          {currentTab === 'approved_technicians' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <Award size={20} />
                <div>
                  <strong>Approved Technicians</strong>
                  <p>
                    View verified technicians who are approved and eligible for service jobs.
                  </p>
                </div>
              </div>

              <section className="content-panel admin-table-panel">
                <div className="panel-header-row">
                  <h3>Approved Technicians</h3>
                  <span className="status-count-badge">
                    {app?.status === 'approved' ? '1 Approved' : 'No approved technicians yet'}
                  </span>
                </div>

                {!app || app.status !== 'approved' ? (
                  <div className="admin-empty-state">
                    <Award size={36} />
                    <h4>No approved technicians yet</h4>
                    <p>
                      Technicians must complete the application, pass practical assessment, and receive final approval to appear here.
                    </p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Experience</th>
                          <th>Specialization</th>
                          <th>Skills</th>
                          <th>Languages</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Service Radius</th>
                          <th>Assessment</th>
                          <th>Approval</th>
                          <th>Eligibility</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <strong>{profile.name}</strong>
                          </td>
                          <td>{profile.email}</td>
                          <td>{profile.mobile}</td>
                          <td>{profile.experience} years</td>
                          <td>{profile.specializations.join(', ') || profile.specialization}</td>
                          <td>{profile.skills.join(', ') || 'None'}</td>
                          <td>{profile.languages.join(', ')}</td>
                          <td>{profile.city}</td>
                          <td>{profile.state}</td>
                          <td>{profile.serviceRadiusKm} km</td>
                          <td>
                            <span className="status-pill success">Passed</span>
                          </td>
                          <td>
                            <span className="status-pill success">Approved</span>
                          </td>
                          <td>
                            <span className="status-pill success">Eligible</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => setViewingApplication(true)}
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {currentTab === 'customers' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <Users size={20} />
                <div>
                  <strong>Customers</strong>
                  <p>View registered customer information.</p>
                </div>
              </div>

              <section className="content-panel admin-table-panel">
                <div className="panel-header-row">
                  <h3>Registered Customers</h3>
                  <span className="status-count-badge">
                    {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'}
                  </span>
                </div>

                <div className="catalog-toolbar" style={{ marginBottom: '18px' }}>
                  <div className="catalog-search">
                    <Search size={17} />
                    <input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Search customers..."
                      aria-label="Search customers"
                    />
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Pincode</th>
                        <th>Landmark</th>
                        <th>Preferred Language</th>
                        <th>Registered Date</th>
                        <th>Account Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={`${customer.email}-${customer.mobile}`}>
                          <td><strong>{customer.name}</strong></td>
                          <td>{customer.email}</td>
                          <td>{customer.mobile}</td>
                          <td>{customer.address1}{customer.address2 ? `, ${customer.address2}` : ''}</td>
                          <td>{customer.city}</td>
                          <td>{customer.state}</td>
                          <td>{customer.pincode}</td>
                          <td>{customer.landmark}</td>
                          <td>{customer.preferredLanguage || (customer.language === 'ta' ? 'Tamil' : customer.language === 'te' ? 'Telugu' : 'English')}</td>
                          <td>{customer.registeredDate || 'N/A'}</td>
                          <td>
                            <span className={`status-pill ${customer.accountStatus === 'Active' ? 'success' : 'warning'}`}>
                              {customer.accountStatus || 'Active'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="admin-empty-state">
                    <Users size={36} />
                    <h4>No customers found</h4>
                    <p>Try a different search term using customer name, email, mobile number, or city.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <Settings size={20} />
                <div>
                  <strong>Settings</strong>
                  <p>Manage your administrator profile, portal information and account security.</p>
                </div>
              </div>

              {profileToast && <div className="admin-settings-toast success">Profile updated successfully.</div>}
              {portalToast && <div className="admin-settings-toast success">Portal settings updated successfully.</div>}
              {passwordToast && <div className="admin-settings-toast success">Password changed successfully.</div>}

              <div className="admin-settings-grid">
                <section className="content-panel admin-settings-card">
                  <div className="panel-header-row">
                    <h3>Admin Profile</h3>
                  </div>
                  <p className="admin-settings-subtitle">Manage your administrator account information.</p>

                  <div className="admin-settings-list">
                    <div className="admin-setting-row">
                      <span>Name</span>
                      <strong>{adminProfile.name}</strong>
                    </div>
                    <div className="admin-setting-row">
                      <span>Email</span>
                      <strong>{adminProfile.email}</strong>
                    </div>
                    <div className="admin-setting-row">
                      <span>Mobile Number</span>
                      <strong>{adminProfile.mobile}</strong>
                    </div>
                    <div className="admin-setting-row">
                      <span>Role</span>
                      <strong>{adminProfile.role}</strong>
                    </div>
                  </div>

                  <div className="admin-settings-actions">
                    <button type="button" className="primary-button compact-button" onClick={() => { setProfileForm(adminProfile); setProfileErrors({}); setProfileModalOpen(true) }}>
                      Edit Profile
                    </button>
                  </div>
                </section>

                <section className="content-panel admin-settings-card">
                  <div className="panel-header-row">
                    <h3>Portal Settings</h3>
                  </div>
                  <p className="admin-settings-subtitle">Manage basic SmartAssist portal information.</p>

                  <form className="portal-form admin-settings-form" onSubmit={handlePortalSettingsSave}>
                    <div className="technician-field">
                      <label htmlFor="portal-name">Portal Name</label>
                      <input
                        id="portal-name"
                        type="text"
                        value={portalSettings.portalName}
                        onChange={(e) => setPortalSettings((current) => ({ ...current, portalName: e.target.value }))}
                      />
                    </div>

                    <div className="technician-field">
                      <label htmlFor="support-email">Support Email</label>
                      <input
                        id="support-email"
                        type="email"
                        value={portalSettings.supportEmail}
                        onChange={(e) => setPortalSettings((current) => ({ ...current, supportEmail: e.target.value }))}
                      />
                    </div>

                    <div className="technician-field">
                      <label htmlFor="support-phone">Support Phone</label>
                      <input
                        id="support-phone"
                        type="tel"
                        value={portalSettings.supportPhone}
                        onChange={(e) => setPortalSettings((current) => ({ ...current, supportPhone: e.target.value }))}
                      />
                    </div>

                    <div className="admin-settings-actions right-align">
                      <button type="submit" className="primary-button compact-button">Save Changes</button>
                    </div>
                  </form>
                </section>

                <section className="content-panel admin-settings-card">
                  <div className="panel-header-row">
                    <h3>Security</h3>
                  </div>
                  <p className="admin-settings-subtitle">Manage your administrator account security.</p>

                  <div className="admin-settings-actions">
                    <button type="button" className="primary-button compact-button" onClick={() => { setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordErrors({}); setPasswordModalOpen(true) }}>
                      Change Password
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      {profileModalOpen && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-profile-title">
          <div className="ticket-modal admin-app-modal">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => { setProfileModalOpen(false); setProfileErrors({}) }}>
              <X size={18} />
            </button>
            <div className="review-modal-header">
              <span className="ai-entry-icon"><UserRound size={24} /></span>
              <div>
                <h2 id="admin-profile-title">Edit Profile</h2>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="portal-form">
              <div className="technician-field">
                <label htmlFor="admin-profile-name">Full Name</label>
                <input
                  id="admin-profile-name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))}
                />
                {profileErrors.name && <small className="field-error">{profileErrors.name}</small>}
              </div>

              <div className="technician-field">
                <label htmlFor="admin-profile-email">Email</label>
                <input
                  id="admin-profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((current) => ({ ...current, email: e.target.value }))}
                />
                {profileErrors.email && <small className="field-error">{profileErrors.email}</small>}
              </div>

              <div className="technician-field">
                <label htmlFor="admin-profile-mobile">Mobile Number</label>
                <input
                  id="admin-profile-mobile"
                  type="tel"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm((current) => ({ ...current, mobile: e.target.value }))}
                />
                {profileErrors.mobile && <small className="field-error">{profileErrors.mobile}</small>}
              </div>

              <div className="technician-field">
                <label htmlFor="admin-profile-role">Role</label>
                <input id="admin-profile-role" type="text" value={adminProfile.role} readOnly />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => { setProfileModalOpen(false); setProfileErrors({}) }}>Cancel</button>
                <button type="submit" className="primary-button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-password-title">
          <div className="ticket-modal admin-app-modal">
            <button className="modal-close" type="button" aria-label="Close" onClick={() => { setPasswordModalOpen(false); setPasswordErrors({}) }}>
              <X size={18} />
            </button>
            <div className="review-modal-header">
              <span className="ai-entry-icon"><Settings size={24} /></span>
              <div>
                <h2 id="admin-password-title">Change Password</h2>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="portal-form">
              <div className="technician-field">
                <label htmlFor="current-password">Current Password *</label>
                <div className="password-wrap">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="icon-button" onClick={() => setShowCurrentPassword((current) => !current)} aria-label="Toggle current password visibility">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <small className="field-error">{passwordErrors.currentPassword}</small>}
              </div>

              <div className="technician-field">
                <label htmlFor="new-password">New Password *</label>
                <div className="password-wrap">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, newPassword: e.target.value }))}
                    placeholder="At least 8 characters"
                  />
                  <button type="button" className="icon-button" onClick={() => setShowNewPassword((current) => !current)} aria-label="Toggle new password visibility">
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.newPassword && <small className="field-error">{passwordErrors.newPassword}</small>}
              </div>

              <div className="technician-field">
                <label htmlFor="confirm-password">Confirm New Password *</label>
                <div className="password-wrap">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" className="icon-button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label="Toggle confirm password visibility">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <small className="field-error">{passwordErrors.confirmPassword}</small>}
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => { setPasswordModalOpen(false); setPasswordErrors({}) }}>Cancel</button>
                <button type="submit" className="primary-button">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
          <div className="ticket-modal admin-app-modal">
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setSelectedCustomer(null)}
            >
              <X size={18} />
            </button>

            <div className="review-modal-header">
              <span className="ai-entry-icon">
                <UserRound size={24} />
              </span>
              <div>
                <h2 id="customer-details-title">Customer Details</h2>
                <p>{selectedCustomer.name}</p>
              </div>
            </div>

            <div className="review-modal-content">
              <section className="review-section">
                <h3>Personal Details</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span>Name</span>
                    <strong>{selectedCustomer.name}</strong>
                  </div>
                  <div className="review-item">
                    <span>Email</span>
                    <strong>{selectedCustomer.email}</strong>
                  </div>
                  <div className="review-item">
                    <span>Mobile</span>
                    <strong>{selectedCustomer.mobile}</strong>
                  </div>
                </div>
              </section>

              <section className="review-section">
                <h3>Address Details</h3>
                <div className="review-grid">
                  <div className="review-item full-width">
                    <span>Address Line 1</span>
                    <strong>{selectedCustomer.address1}</strong>
                  </div>
                  <div className="review-item full-width">
                    <span>Address Line 2</span>
                    <strong>{selectedCustomer.address2 || 'Not provided'}</strong>
                  </div>
                  <div className="review-item">
                    <span>City</span>
                    <strong>{selectedCustomer.city}</strong>
                  </div>
                  <div className="review-item">
                    <span>State</span>
                    <strong>{selectedCustomer.state}</strong>
                  </div>
                  <div className="review-item">
                    <span>Pincode</span>
                    <strong>{selectedCustomer.pincode}</strong>
                  </div>
                  <div className="review-item">
                    <span>Landmark</span>
                    <strong>{selectedCustomer.landmark}</strong>
                  </div>
                  <div className="review-item full-width">
                    <span>Location</span>
                    <strong>{selectedCustomer.location}</strong>
                  </div>
                </div>
              </section>

              <section className="review-section">
                <h3>Account Details</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span>Preferred Language</span>
                    <strong>{selectedCustomer.preferredLanguage || (selectedCustomer.language === 'ta' ? 'Tamil' : selectedCustomer.language === 'te' ? 'Telugu' : 'English')}</strong>
                  </div>
                  <div className="review-item">
                    <span>Registered Date</span>
                    <strong>{selectedCustomer.registeredDate || 'N/A'}</strong>
                  </div>
                  <div className="review-item">
                    <span>Account Status</span>
                    <strong>{selectedCustomer.accountStatus || 'Active'}</strong>
                  </div>
                  <div className="review-item">
                    <span>Last Login</span>
                    <strong>{selectedCustomer.lastLogin || 'Not available'}</strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW APPLICATION DETAILS (STEP 6) */}
      {viewingApplication && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-app-title">
          <div className="ticket-modal admin-app-modal">
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setViewingApplication(false)}
            >
              <X size={18} />
            </button>

            <div className="review-modal-header">
              <span className="ai-entry-icon">
                <FileText size={24} />
              </span>
              <div>
                <h2 id="admin-app-title">Technician Application: {profile.name}</h2>
                <p>Application ID: {app?.applicationId || 'APP-54112271'} · Submitted: {app?.submittedAt || 'Aug 29, 2026'}</p>
              </div>
            </div>

            <div className="review-modal-content">
              <section className="review-section">
                <h3>Personal Information</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span>Full Name</span>
                    <strong>{profile.name}</strong>
                  </div>
                  <div className="review-item">
                    <span>Email Address</span>
                    <strong>{profile.email}</strong>
                  </div>
                  <div className="review-item">
                    <span>Mobile Number</span>
                    <strong>{profile.mobile}</strong>
                  </div>
                </div>
              </section>

              <section className="review-section">
                <h3>Professional Information</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span>Experience</span>
                    <strong>{profile.experience} years</strong>
                  </div>
                  <div className="review-item">
                    <span>Specializations</span>
                    <strong>{profile.specializations.join(', ') || profile.specialization}</strong>
                  </div>
                  <div className="review-item">
                    <span>Skills / Categories</span>
                    <strong>{profile.skills.join(', ') || 'None selected'}</strong>
                  </div>
                  <div className="review-item">
                    <span>Languages</span>
                    <strong>{profile.languages.join(', ')}</strong>
                  </div>
                </div>
                {profile.experienceSummary && (
                  <div className="experience-box">
                    <span>Summary:</span>
                    <p>{profile.experienceSummary}</p>
                  </div>
                )}
              </section>

              <section className="review-section">
                <h3>Service Area & Availability</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span>City & State</span>
                    <strong>{profile.city}, {profile.state}</strong>
                  </div>
                  <div className="review-item">
                    <span>Service Radius</span>
                    <strong>{profile.serviceRadiusKm} km</strong>
                  </div>
                  <div className="review-item">
                    <span>Pincodes</span>
                    <strong>{profile.pincodes.join(', ')}</strong>
                  </div>
                  <div className="review-item">
                    <span>Working Schedule</span>
                    <strong>
                      {profile.workingDays.join(', ')} ({profile.workingHours?.start} - {profile.workingHours?.end})
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="modal-actions admin-app-actions">
              <button
                type="button"
                className="danger-button"
                onClick={() => setRejectModalOpen(true)}
              >
                <XCircle size={15} /> Reject Application
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setChangeNoteModalOpen(true)}
              >
                <AlertTriangle size={15} /> Request Changes
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleApproveForAssessment}
              >
                <Check size={16} /> Approve for Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST CHANGES WITH NOTE */}
      {changeNoteModalOpen && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="change-modal-title">
          <div className="ticket-modal">
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setChangeNoteModalOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="change-modal-title">Request Profile Changes</h2>
            <p>Enter the reason or changes needed. The technician will see this note on their dashboard.</p>
            <form onSubmit={handleRequestChanges}>
              <div className="technician-field">
                <label htmlFor="change-note">Admin Note *</label>
                <textarea
                  id="change-note"
                  className="experience-summary"
                  rows={3}
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="e.g. Please select additional service pincodes and provide valid certifications."
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setChangeNoteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Send Change Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT APPLICATION */}
      {rejectModalOpen && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
          <div className="ticket-modal">
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setRejectModalOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="reject-modal-title">Reject Application</h2>
            <p>Specify the rejection reason. The technician will not be eligible for assessments or jobs.</p>
            <form onSubmit={handleReject}>
              <div className="technician-field">
                <label htmlFor="reject-reason">Rejection Reason *</label>
                <textarea
                  id="reject-reason"
                  className="experience-summary"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete background verification or service territory not covered."
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="danger-button">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ASSIGN ASSESSMENT CENTER (STEP 7) */}
      {assignModalOpen && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="assign-center-title">
          <div className="ticket-modal admin-assign-modal">
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setAssignModalOpen(false)}
            >
              <X size={18} />
            </button>

            <div className="review-modal-header">
              <span className="ai-entry-icon">
                <Calendar size={24} />
              </span>
              <div>
                <h2 id="assign-center-title">Assign Assessment Center (Step 7)</h2>
                <p>Assign practical evaluation location for <strong>{profile.name}</strong></p>
              </div>
            </div>

            <form onSubmit={handleAssignAssessmentSubmit} className="portal-form">
              <div className="technician-field">
                <label htmlFor="assessment-center">Assessment Center *</label>
                <select
                  id="assessment-center"
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                >
                  {state.assessmentCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="technician-field">
                <label htmlFor="center-address">Center Address</label>
                <input
                  id="center-address"
                  type="text"
                  value={currentCenter ? `${currentCenter.address}, ${currentCenter.city}, ${currentCenter.state}` : ''}
                  readOnly
                />
              </div>

              <div className="technician-field">
                <label htmlFor="assessment-spec">Specialization Track *</label>
                <select
                  id="assessment-spec"
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                >
                  {(profile.specializations.length > 0 ? profile.specializations : ['Smart Home Installation', 'CCTV & Security']).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="technician-field">
                  <label htmlFor="assessment-date">Assessment Date *</label>
                  <input
                    id="assessment-date"
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="technician-field">
                  <label htmlFor="assessment-time">Assessment Time *</label>
                  <input
                    id="assessment-time"
                    type="text"
                    value={assessmentTime}
                    onChange={(e) => setAssessmentTime(e.target.value)}
                    placeholder="10:00 AM"
                    required
                  />
                </div>
              </div>

              <div className="technician-field">
                <label htmlFor="assessment-instructions">Instructions for Technician *</label>
                <textarea
                  id="assessment-instructions"
                  className="experience-summary"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Bring required tools and arrive 15 minutes early."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Check size={16} /> Assign Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
