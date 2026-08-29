import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Home,
  LogOut,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  UserCheck,
  UserRound,
  Users,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { useMockStore, mockStore } from '../../services/mockStore'
import type { AssessmentDetails } from '../../types/technicianPortal'

type AdminTab = 'applications' | 'assessments' | 'approvals' | 'tickets'

export function AdminPortal() {
  const navigate = useNavigate()
  const state = useMockStore()
  const [currentTab, setCurrentTab] = useState<AdminTab>('applications')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

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

  // Ticket rating simulation
  const [ratingValue, setRatingValue] = useState(5)
  const [ratingReview, setRatingReview] = useState('Mark was very punctual, diagnosed the faulty board quickly, and fixed our switch cleanly!')

  const profile = state.technicianProfile
  const app = state.application
  const currentCenter = state.assessmentCenters.find((c) => c.id === selectedCenterId) || state.assessmentCenters[0]

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
    setCurrentTab('tickets')
  }

  const handleAssignJob = (ticketId: string) => {
    mockStore.assignTicketToTechnician(ticketId, 'TECH-MK-01', profile.name)
  }

  const handleCustomerRate = (ticketId: string) => {
    mockStore.rateTechnician(ticketId, ratingValue, ratingReview)
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
            className={currentTab === 'tickets' ? 'customer-nav active' : 'customer-nav'}
            onClick={() => setCurrentTab('tickets')}
          >
            <Ticket size={18} />
            Tickets & Jobs
            <span className="nav-count">{state.tickets.length}</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="admin-quick-switch">
          <small>PORTAL SWITCHER</small>
          <button
            type="button"
            className="switch-portal-button"
            onClick={() => navigate('/technician/dashboard')}
          >
            <Wrench size={14} /> Switch to Technician View
          </button>
          <button
            type="button"
            className="switch-portal-button"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Home size={14} /> Switch to Customer View
          </button>
        </div>

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
              {currentTab === 'applications' && 'Technician Applications (Step 6)'}
              {currentTab === 'assessments' && 'Practical Assessment Assignment & Evaluation (Steps 7 & 8)'}
              {currentTab === 'approvals' && 'Final Technician Approval (Step 9)'}
              {currentTab === 'tickets' && 'Customer Tickets & Job Assignment (Step 10)'}
            </h1>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="secondary-button compact-button"
              onClick={() => {
                if (window.confirm('Reset all demo data to initial state?')) {
                  mockStore.resetStore()
                }
              }}
            >
              <RotateCcw size={14} /> Reset Demo Data
            </button>
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
                      onClick={() => setCurrentTab('tickets')}
                    >
                      View Tickets & Assign Jobs (Step 10)
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
          {currentTab === 'tickets' && (
            <div className="admin-section-content">
              <div className="admin-info-banner">
                <Ticket size={20} />
                <div>
                  <strong>Steps 10 & 11: Customer Tickets & Job Assignment</strong>
                  <p>
                    Match customer tickets to approved technicians based on specialization, skills, language, and service area.
                  </p>
                </div>
              </div>

              <div className="admin-tickets-layout">
                {/* Tickets List */}
                <section className="content-panel">
                  <div className="panel-header-row">
                    <h3>Customer Service Tickets</h3>
                    <span className="status-count-badge">{state.tickets.length} Tickets</span>
                  </div>

                  <div className="ticket-cards-list">
                    {state.tickets.map((ticket) => {
                      const isAssignedToMark = ticket.assignedTechnicianId === 'TECH-MK-01'
                      return (
                        <article
                          key={ticket.id}
                          className={`admin-ticket-card ${selectedTicketId === ticket.id ? 'selected' : ''}`}
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <div className="admin-ticket-top">
                            <span className="ticket-id-tag">
                              <Ticket size={14} /> {ticket.id}
                            </span>
                            <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                              {ticket.priority} Priority
                            </span>
                            <span className={`status-pill ${ticket.status === 'COMPLETED' ? 'success' : ticket.status === 'CREATED' ? 'info' : 'warning'}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="admin-ticket-main">
                            <h4>{ticket.deviceName} ({ticket.brand})</h4>
                            <p className="ticket-problem">
                              <em>Problem:</em> "{ticket.problemDescription}"
                            </p>
                            <div className="ticket-customer-meta">
                              <span><strong>Customer:</strong> {ticket.customerName}</span>
                              <span><strong>Phone:</strong> {ticket.customerPhone}</span>
                              <span><strong>Language:</strong> {ticket.customerLanguage}</span>
                            </div>
                            <div className="ticket-location-meta">
                              <MapPin size={13} /> {ticket.customerAddress}
                            </div>
                          </div>

                          <div className="admin-ticket-footer">
                            {isAssignedToMark ? (
                              <div className="assigned-tech-tag">
                                <ShieldCheck size={14} /> Assigned to: <strong>{ticket.assignedTechnicianName}</strong>
                              </div>
                            ) : (
                              <span className="unassigned-text">Unassigned Ticket</span>
                            )}
                            <button
                              type="button"
                              className="text-button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTicketId(ticket.id)
                              }}
                            >
                              Details & Assign →
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>

                {/* Selected Ticket Details & Assignment Panel */}
                {(() => {
                  const selectedTicket = state.tickets.find((t) => t.id === selectedTicketId) || state.tickets[0]
                  if (!selectedTicket) return null

                  const isApproved = app?.status === 'approved' || profile.status === 'approved'
                  const isAssigned = Boolean(selectedTicket.assignedTechnicianId)

                  return (
                    <section className="content-panel admin-assign-detail-panel">
                      <div className="panel-header-row">
                        <h3>Ticket Inspection: {selectedTicket.id}</h3>
                        <span className="device-badge-sm">{selectedTicket.deviceName}</span>
                      </div>

                      {/* Ticket Summary */}
                      <div className="ticket-inspection-box">
                        <div className="review-grid">
                          <div className="review-item">
                            <span>Customer Name</span>
                            <strong>{selectedTicket.customerName}</strong>
                          </div>
                          <div className="review-item">
                            <span>Contact Phone</span>
                            <strong>{selectedTicket.customerPhone}</strong>
                          </div>
                          <div className="review-item">
                            <span>Customer Address</span>
                            <strong>{selectedTicket.customerAddress}</strong>
                          </div>
                          <div className="review-item">
                            <span>Preferred Language</span>
                            <strong>{selectedTicket.customerLanguage}</strong>
                          </div>
                          <div className="review-item full-width">
                            <span>Customer Original Problem Report</span>
                            <strong className="problem-highlight">"{selectedTicket.problemDescription}"</strong>
                          </div>
                        </div>

                        {/* Customer Arrival OTP Reveal Box (for Demo/Testing) */}
                        <div className="customer-otp-simulator-box">
                          <div className="otp-sim-header">
                            <Zap size={16} />
                            <span>Customer Ticket OTP (Used for Step 11 Arrival Verification)</span>
                          </div>
                          <div className="otp-sim-body">
                            <strong>{selectedTicket.otp}</strong>
                            <small>
                              {selectedTicket.otpVerified
                                ? '✓ Verified by Technician on site'
                                : 'Share this 6-digit OTP when technician arrives to unlock repair'}
                            </small>
                          </div>
                        </div>

                        {/* AI Troubleshooting Section */}
                        {selectedTicket.aiTroubleshooting && (
                          <div className="ai-summary-card">
                            <div className="ai-summary-header">
                              <Sparkles size={16} />
                              <h4>AI Troubleshooting Summary</h4>
                            </div>
                            <div className="ai-summary-details">
                              <div>
                                <span>Problem Description:</span>
                                <p>{selectedTicket.aiTroubleshooting.problemDescription}</p>
                              </div>
                              <div>
                                <span>Troubleshooting Steps:</span>
                                <ul>
                                  {selectedTicket.aiTroubleshooting.troubleshootingSteps.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span>Key Findings:</span>
                                <p>{selectedTicket.aiTroubleshooting.keyFindings}</p>
                              </div>
                              <div>
                                <span>Escalation Reason:</span>
                                <p>{selectedTicket.aiTroubleshooting.escalationReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Technician Assignment Section */}
                      <div className="assignment-section">
                        <h4>Suitable Technicians (Matching Criteria)</h4>

                        {!isApproved ? (
                          <div className="admin-empty-state-card warning">
                            <AlertTriangle size={24} />
                            <p>
                              No technicians are currently <strong>Eligible for Jobs</strong>. Complete Steps 5–9 to approve Mark Kumar.
                            </p>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => {
                                mockStore.finalApproveTechnician()
                              }}
                            >
                              Fast-Approve Mark Kumar (Demo)
                            </button>
                          </div>
                        ) : (
                          <div className="suitable-tech-card">
                            <div className="tech-card-top">
                              <span className="avatar">MK</span>
                              <div>
                                <strong>{profile.name}</strong>
                                <small>Verified Smart Home Specialist · 4.9 ★</small>
                              </div>
                              <span className="status-pill success">Available</span>
                            </div>

                            <div className="tech-match-grid">
                              <div>
                                <span>Specialization:</span>
                                <strong>{profile.specializations.join(', ') || profile.specialization}</strong>
                              </div>
                              <div>
                                <span>Languages:</span>
                                <strong>{profile.languages.join(', ')}</strong>
                              </div>
                              <div>
                                <span>Service Area:</span>
                                <strong>{profile.serviceArea || profile.city} (Radius: {profile.serviceRadiusKm} km)</strong>
                              </div>
                              <div>
                                <span>Availability:</span>
                                <strong>{profile.availability || '09:00 - 18:00'}</strong>
                              </div>
                            </div>

                            <div className="tech-card-actions">
                              {isAssigned ? (
                                <div className="assigned-confirm-box">
                                  <CheckCircle2 size={16} className="success-icon" />
                                  <span>Assigned to {selectedTicket.assignedTechnicianName} ({selectedTicket.status})</span>
                                  <button
                                    type="button"
                                    className="outline-button compact-button"
                                    onClick={() => navigate(`/technician/jobs/${selectedTicket.id}`)}
                                  >
                                    View in Technician Portal <ExternalLink size={13} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="primary-button"
                                  onClick={() => handleAssignJob(selectedTicket.id)}
                                >
                                  <Check size={16} /> Assign Job to {profile.name}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Customer Rating Simulation for Completed Job (Step 11.17) */}
                      {selectedTicket.status === 'COMPLETED' && (
                        <div className="customer-rating-simulator">
                          <div className="rating-header">
                            <Star size={18} className="star-icon" />
                            <h4>Customer Rating Simulation (Step 11.17)</h4>
                          </div>
                          <p className="rating-desc">
                            The repair is completed. Simulate the customer rating the technician:
                          </p>
                          {selectedTicket.customerRating ? (
                            <div className="rating-submitted-box">
                              <div className="stars-row">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={18}
                                    fill={s <= selectedTicket.customerRating! ? '#eab308' : 'none'}
                                    color={s <= selectedTicket.customerRating! ? '#eab308' : '#cbd5e1'}
                                  />
                                ))}
                                <strong>{selectedTicket.customerRating}.0 / 5.0</strong>
                              </div>
                              <p>"{selectedTicket.customerReview || 'Excellent service!'}"</p>
                            </div>
                          ) : (
                            <div className="rating-input-form">
                              <div className="stars-selector">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    className="star-button"
                                    onClick={() => setRatingValue(star)}
                                  >
                                    <Star
                                      size={22}
                                      fill={star <= ratingValue ? '#eab308' : 'none'}
                                      color={star <= ratingValue ? '#eab308' : '#cbd5e1'}
                                    />
                                  </button>
                                ))}
                                <span>{ratingValue} Stars</span>
                              </div>
                              <input
                                type="text"
                                className="rating-input"
                                value={ratingReview}
                                onChange={(e) => setRatingReview(e.target.value)}
                                placeholder="Write customer feedback..."
                              />
                              <button
                                type="button"
                                className="primary-button compact-button"
                                onClick={() => handleCustomerRate(selectedTicket.id)}
                              >
                                Submit Customer Rating
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

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
