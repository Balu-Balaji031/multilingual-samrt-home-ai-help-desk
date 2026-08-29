import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  MessageCircle,
  ShieldCheck,
  Star,
  Ticket,
  Wrench,
  XCircle,
} from 'lucide-react'
import { useMockStore, mockStore } from '../../services/mockStore'
import { ApplicationReviewModal } from './ApplicationReviewModal'

export function TechnicianDashboard() {
  const navigate = useNavigate()
  const state = useMockStore()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [submittingApp, setSubmittingApp] = useState(false)

  const profile = state.technicianProfile
  const app = state.application
  const notSet = 'Not Set'

  // Profile validation
  const missingFields: string[] = []
  if (!profile.name) missingFields.push('Full Name')
  if (!profile.email) missingFields.push('Email Address')
  if (!profile.mobile) missingFields.push('Mobile Number')
  if (!profile.experience) missingFields.push('Experience')
  if (profile.specializations.length === 0) missingFields.push('Specialization')
  if (profile.languages.length === 0) missingFields.push('Language')
  if (!profile.city || !profile.state) missingFields.push('Service Area')
  if (profile.pincodes.length === 0) missingFields.push('Service Pincodes')
  if (!profile.serviceRadiusKm) missingFields.push('Service Radius')
  if (profile.workingDays.length === 0) missingFields.push('Working Days')
  if (!profile.workingHours?.start || !profile.workingHours?.end) missingFields.push('Working Hours')

  const isProfileComplete = missingFields.length === 0

  // Assigned jobs
  const myAssignedJobs = state.tickets.filter((t) => t.assignedTechnicianId === 'TECH-MK-01')
  const completedJobs = myAssignedJobs.filter((t) => t.status === 'COMPLETED')
  const pendingJobs = myAssignedJobs.filter((t) => t.status !== 'COMPLETED')

  // Top summary values
  const isApproved = app?.status === 'approved' || profile.status === 'approved'

  // Application Submission Handler (Step 5)
  const handleOpenReview = () => {
    setReviewModalOpen(true)
  }

  const handleSubmitApplication = async () => {
    if (!isProfileComplete) return
    setSubmittingApp(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    mockStore.submitApplication()
    setSubmittingApp(false)
    setReviewModalOpen(false)
  }

  // Timeline Step Calculations
  const timelineSteps = [
    {
      label: 'Profile',
      detail: isProfileComplete ? 'Completed' : 'Incomplete',
      status: isProfileComplete ? 'complete' : 'current',
    },
    {
      label: 'Application',
      detail: app ? 'Submitted' : isProfileComplete ? 'Ready to Submit' : 'Pending',
      status: app ? 'complete' : isProfileComplete ? 'current' : 'future',
    },
    {
      label: 'Admin Review',
      detail:
        app?.status === 'approved_for_assessment' ||
        app?.status === 'assessment_scheduled' ||
        app?.status === 'assessment_passed' ||
        app?.status === 'approved'
          ? 'Approved'
          : app?.status === 'changes_requested'
          ? 'Changes Requested'
          : app?.status === 'rejected'
          ? 'Rejected'
          : app?.status === 'pending_review'
          ? 'Pending'
          : 'Not Started',
      status:
        app?.status === 'approved_for_assessment' ||
        app?.status === 'assessment_scheduled' ||
        app?.status === 'assessment_passed' ||
        app?.status === 'approved'
          ? 'complete'
          : app?.status === 'pending_review' || app?.status === 'changes_requested'
          ? 'current'
          : 'future',
    },
    {
      label: 'Assessment Center',
      detail:
        app?.assessment
          ? 'Scheduled'
          : app?.status === 'approved_for_assessment'
          ? 'Assigning'
          : 'Not Assigned',
      status: app?.assessment ? 'complete' : app?.status === 'approved_for_assessment' ? 'current' : 'future',
    },
    {
      label: 'Practical Assessment',
      detail:
        app?.assessment?.result === 'pass'
          ? 'Passed'
          : app?.assessment?.result === 'fail'
          ? 'Failed'
          : app?.assessment
          ? 'Scheduled'
          : 'Not Started',
      status:
        app?.assessment?.result === 'pass'
          ? 'complete'
          : app?.assessment
          ? 'current'
          : 'future',
    },
    {
      label: 'Admin Approval',
      detail: isApproved ? 'Approved' : app?.assessment?.result === 'pass' ? 'Pending' : 'Not Started',
      status: isApproved ? 'complete' : app?.assessment?.result === 'pass' ? 'current' : 'future',
    },
    {
      label: 'Job Eligibility',
      detail: isApproved ? 'Eligible for Jobs' : 'Not Eligible',
      status: isApproved ? 'complete' : 'future',
    },
  ]

  return (
    <div className="technician-dashboard">
      {/* Top Welcome Banner */}
      <section className="technician-welcome">
        <div>
          <span className="section-kicker">SMARTASSIST TECHNICIAN PORTAL</span>
          <h1>Welcome back, {profile.name.split(' ')[0]} 👋</h1>
          <p>
            {isApproved
              ? 'Your professional certification is active. You are eligible to receive and manage on-site smart home repair jobs.'
              : 'Follow your professional verification journey. Complete requirements, attend practical evaluation, and unlock customer assignments.'}
          </p>
        </div>
      </section>

      {/* Top Stats Cards */}
      <div className="technician-summary-grid">
        {isApproved ? (
          <>
            <article className="technician-summary-card">
              <span className="technician-summary-icon blue">
                <Ticket size={19} />
              </span>
              <span>
                <small>Assigned Jobs</small>
                <strong>{myAssignedJobs.length}</strong>
              </span>
            </article>
            <article className="technician-summary-card">
              <span className="technician-summary-icon warning">
                <Clock size={19} />
              </span>
              <span>
                <small>Pending Jobs</small>
                <strong>{pendingJobs.length}</strong>
              </span>
            </article>
            <article className="technician-summary-card">
              <span className="technician-summary-icon success">
                <CheckCircle2 size={19} />
              </span>
              <span>
                <small>Completed Jobs</small>
                <strong>{completedJobs.length}</strong>
              </span>
            </article>
            <article className="technician-summary-card">
              <span className="technician-summary-icon purple">
                <Star size={19} />
              </span>
              <span>
                <small>Average Rating</small>
                <strong>4.9 ★</strong>
              </span>
            </article>
          </>
        ) : (
          <>
            <article className="technician-summary-card">
              <span className="technician-summary-icon">
                <Wrench size={19} />
              </span>
              <span>
                <small>Specialization</small>
                <strong>{profile.specialization || profile.specializations[0] || notSet}</strong>
              </span>
            </article>
            <article className="technician-summary-card">
              <span className="technician-summary-icon">
                <MessageCircle size={19} />
              </span>
              <span>
                <small>Languages</small>
                <strong>{profile.languages.length ? profile.languages.join(', ') : notSet}</strong>
              </span>
            </article>
            <article className="technician-summary-card">
              <span className="technician-summary-icon">
                <Home size={19} />
              </span>
              <span>
                <small>Service Area</small>
                <strong>{profile.serviceArea || profile.city || notSet}</strong>
              </span>
            </article>
            <article className="technician-summary-card">
              <span className="technician-summary-icon">
                <ShieldCheck size={19} />
              </span>
              <span>
                <small>Application</small>
                <strong>
                  {isApproved
                    ? 'Approved'
                    : app
                    ? app.status.replace('_', ' ')
                    : isProfileComplete
                    ? 'Ready to Submit'
                    : 'Profile Pending'}
                </strong>
              </span>
            </article>
          </>
        )}
      </div>

      {/* STEP 5 & 6 & 7 & 8 & 9 DYNAMIC STATUS BANNERS */}

      {/* 1. Step 5: Profile Ready to Submit Banner */}
      {!app && (
        <section className="technician-panel application-cta-panel">
          <div className="cta-panel-content">
            <span className="cta-icon">
              <ShieldCheck size={28} />
            </span>
            <div>
              <span className="status-badge success">Status: Ready to Submit</span>
              <h2>Submit Your Professional Application</h2>
              <p>
                Your profile is complete! Submit your professional details to the SmartAssist Admin team for review and assessment scheduling.
              </p>
            </div>
          </div>
          <div className="cta-panel-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleOpenReview}
            >
              <FileText size={16} /> Review Application
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleSubmitApplication}
              disabled={!isProfileComplete || submittingApp}
            >
              <Check size={16} /> {submittingApp ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </section>
      )}

      {/* 2. Step 5 Submitted & Under Review Banner */}
      {app && app.status === 'pending_review' && (
        <section className="technician-panel application-submitted-banner">
          <div className="banner-left">
            <CheckCircle2 size={32} className="success-icon" />
            <div>
              <span className="banner-status-tag">✓ Application Submitted</span>
              <h2>Pending Admin Review</h2>
              <p>Your professional application has been submitted for Admin review.</p>
              <div className="submitted-meta-row">
                <span>Application ID: <strong>{app.applicationId}</strong></span>
                <span>•</span>
                <span>Submitted: <strong>{app.submittedAt}</strong></span>
                <span>•</span>
                <span>Status: <strong className="warning-text">Pending Admin Review</strong></span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={handleOpenReview}
          >
            <FileText size={15} /> View Submitted Details
          </button>
        </section>
      )}

      {/* 3. Step 6: Admin Requested Changes Banner */}
      {app && app.status === 'changes_requested' && (
        <section className="technician-panel changes-requested-banner">
          <div className="banner-left">
            <AlertTriangle size={32} className="warning-icon" />
            <div>
              <span className="status-badge warning">Changes Requested</span>
              <h2>Your application needs some changes</h2>
              <p className="admin-note-text">
                <strong>Admin Note:</strong> {app.adminNote || 'Please update your profile details.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="primary-button compact-button"
            onClick={() => navigate('/technician/profile')}
          >
            <Wrench size={15} /> Update Profile
          </button>
        </section>
      )}

      {/* 4. Step 6: Admin Rejection Banner */}
      {app && app.status === 'rejected' && (
        <section className="technician-panel application-rejected-banner">
          <div className="banner-left">
            <XCircle size={32} className="danger-icon" />
            <div>
              <span className="status-badge danger">Application Rejected</span>
              <h2>Application Not Approved</h2>
              <p className="rejection-reason">
                <strong>Admin Reason:</strong> {app.rejectionReason || 'Application does not meet current platform requirements.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5. Steps 7 & 8: Assessment Scheduled Card */}
      {app && app.assessment && (
        <section className="technician-panel assessment-details-panel">
          <div className="technician-panel-heading">
            <div>
              <span className="section-kicker">PRACTICAL ASSESSMENT (STEPS 7 & 8)</span>
              <h2>
                {app.assessment.result === 'pass'
                  ? 'Practical Assessment: Passed ✓'
                  : app.assessment.result === 'fail'
                  ? 'Practical Assessment: Reassessment Required'
                  : 'Practical Assessment: Scheduled'}
              </h2>
            </div>
            <span
              className={`status-badge ${
                app.assessment.result === 'pass'
                  ? 'success'
                  : app.assessment.result === 'fail'
                  ? 'danger'
                  : 'warning'
              }`}
            >
              Status: {app.assessment.result ? app.assessment.result.toUpperCase() : 'Scheduled'}
            </span>
          </div>

          <div className="assessment-card-body">
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
                <span>Instructions for You</span>
                <p className="instructions-copy">{app.assessment.instructions}</p>
              </div>
            </div>

            {app.assessment.result && (
              <div className={`assessment-result-inline ${app.assessment.result}`}>
                <div className="result-headline">
                  <strong>Score: {app.assessment.score} / 100</strong>
                  <span>•</span>
                  <strong>Result: {app.assessment.result === 'pass' ? 'PASSED ✓' : 'FAILED ✕'}</strong>
                </div>
                {app.assessment.evaluatorNotes && (
                  <p className="evaluator-note">
                    <em>Evaluator Notes:</em> {app.assessment.evaluatorNotes}
                  </p>
                )}
                {app.assessment.result === 'fail' && (
                  <p className="reassessment-notice">
                    Your practical assessment was not passed. Please contact admin or wait for reassessment scheduling.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Step 9: Final Admin Approved Banner */}
      {isApproved && (
        <section className="technician-panel approved-eligibility-panel">
          <div className="approved-panel-head">
            <Award size={32} className="trophy-icon" />
            <div>
              <span className="status-badge success">✓ Admin Approved</span>
              <h2>You are now eligible to receive service assignments</h2>
              <p>
                Congratulations! Your profile and practical assessment have been verified. Customer service tickets in your service area can now be assigned to you.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* STEP 10: NEW JOB ASSIGNED BANNER */}
      {myAssignedJobs.some((j) => j.status === 'CREATED') && (
        <section className="technician-panel new-job-banner">
          {(() => {
            const newJob = myAssignedJobs.find((j) => j.status === 'CREATED')!
            return (
              <div className="new-job-content">
                <div className="new-job-left">
                  <span className="pulse-alert-dot" />
                  <div>
                    <span className="section-kicker">NEW JOB ASSIGNED</span>
                    <h2>{newJob.id} · {newJob.deviceName}</h2>
                    <p>
                      Priority: <strong>{newJob.priority}</strong> · Customer: <strong>{newJob.customerName}</strong> ({newJob.customerLocation})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate(`/technician/jobs/${newJob.id}`)}
                >
                  <Ticket size={16} /> View Job & Accept
                </button>
              </div>
            )
          })()}
        </section>
      )}

      {/* APPLICATION VERIFICATION JOURNEY TIMELINE */}
      <section className="technician-panel">
        <div className="technician-panel-heading">
          <div>
            <span className="section-kicker">APPLICATION STATUS</span>
            <h2>Your Verification Journey</h2>
          </div>
          <span className={`status-badge ${isApproved ? 'success' : 'warning'}`}>
            {isApproved ? 'Approved Technician' : 'Verification In Progress'}
          </span>
        </div>

        <div className="application-timeline seven-step">
          {timelineSteps.map((step) => (
            <div className={`application-step ${step.status}`} key={step.label}>
              <span>{step.status === 'complete' ? <Check size={11} /> : step.status === 'current' ? '●' : '○'}</span>
              <div>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROFESSIONAL PROFILE SUMMARY */}
      <section className="technician-panel profile-summary">
        <div className="technician-panel-heading">
          <div>
            <span className="section-kicker">PROFESSIONAL PROFILE</span>
            <h2>Your Service Profile</h2>
          </div>
          <button className="primary-button compact-button" onClick={() => navigate('/technician/profile')}>
            <Wrench size={14} /> Edit Profile
          </button>
        </div>
        <div className="technician-details-grid">
          <div className="review-item">
            <span>Experience</span>
            <strong>{profile.experience ? `${profile.experience} years` : notSet}</strong>
          </div>
          <div className="review-item">
            <span>Specialization</span>
            <strong>{profile.specializations.join(', ') || profile.specialization || notSet}</strong>
          </div>
          <div className="review-item">
            <span>Languages</span>
            <strong>{profile.languages.length ? profile.languages.join(', ') : notSet}</strong>
          </div>
          <div className="review-item">
            <span>Service Area</span>
            <strong>{profile.serviceArea || profile.city || notSet}</strong>
          </div>
          <div className="review-item">
            <span>Availability</span>
            <strong>{profile.availability || notSet}</strong>
          </div>
        </div>
      </section>

      {/* JOBS SECTION / RECENT JOBS */}
      {isApproved && myAssignedJobs.length > 0 ? (
        <section className="technician-panel recent-jobs-panel">
          <div className="technician-panel-heading">
            <div>
              <span className="section-kicker">ACTIVE & RECENT WORK</span>
              <h2>Recent Assigned Jobs</h2>
            </div>
            <Link className="text-button" to="/technician/jobs">
              View All Jobs ({myAssignedJobs.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="recent-jobs-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Device</th>
                  <th>Priority</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myAssignedJobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.id}</strong>
                    </td>
                    <td>{job.deviceName}</td>
                    <td>
                      <span className={`priority-pill ${job.priority.toLowerCase()}`}>
                        {job.priority}
                      </span>
                    </td>
                    <td>{job.customerName}</td>
                    <td>
                      <span className={`status-pill ${job.status === 'COMPLETED' ? 'success' : 'info'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="outline-button compact-button"
                        onClick={() => navigate(`/technician/jobs/${job.id}`)}
                      >
                        View Job <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="technician-panel jobs-empty">
          <div className="empty-job-icon">
            <Ticket size={23} />
          </div>
          <span className="section-kicker">JOBS</span>
          <h2>{isApproved ? 'No service jobs assigned right now' : 'No jobs assigned yet'}</h2>
          <p>
            {isApproved
              ? 'When customers raise support tickets matching your area and skill, they will appear here.'
              : 'Complete your professional profile and pass the required assessment to become eligible for jobs.'}
          </p>
          <button className="text-button" onClick={() => navigate('/technician/jobs')}>
            View All Jobs <ArrowRight size={14} />
          </button>
        </section>
      )}

      {/* Review Modal for Step 5 */}
      <ApplicationReviewModal
        profile={profile}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onEdit={() => {
          setReviewModalOpen(false)
          navigate('/technician/profile')
        }}
        onSubmit={handleSubmitApplication}
        submitting={submittingApp}
        missingFields={missingFields}
      />
    </div>
  )
}
