import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { useMockStore, mockStore } from '../../services/mockStore'
import type { JobStatus, RepairDetails } from '../../types/technicianPortal'

export function TechnicianJobDetails() {
  const { id } = useParams<{ id: string }>()
  const state = useMockStore()

  const ticket = state.tickets.find((t) => t.id === id) || state.tickets[0]

  // Action states
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState('')

  // Repair Form states
  const [rootCause, setRootCause] = useState(ticket?.repairDetails?.rootCause || '')
  const [repairPerformed, setRepairPerformed] = useState(ticket?.repairDetails?.repairPerformed || '')
  const [partsReplaced, setPartsReplaced] = useState(ticket?.repairDetails?.partsReplaced || '')
  const [repairNotes, setRepairNotes] = useState(ticket?.repairDetails?.repairNotes || '')
  const [beforePhoto, setBeforePhoto] = useState<string | null>(ticket?.repairDetails?.beforeImage || null)
  const [afterPhoto, setAfterPhoto] = useState<string | null>(ticket?.repairDetails?.afterImage || null)

  // Checklist states
  const [checklist, setChecklist] = useState({
    deviceInspected: ticket?.repairDetails?.checklist?.deviceInspected || false,
    rootCauseIdentified: ticket?.repairDetails?.checklist?.rootCauseIdentified || false,
    repairPerformed: ticket?.repairDetails?.checklist?.repairPerformed || false,
    deviceTested: ticket?.repairDetails?.checklist?.deviceTested || false,
    customerInformed: ticket?.repairDetails?.checklist?.customerInformed || false,
    workAreaChecked: ticket?.repairDetails?.checklist?.workAreaChecked || false,
  })

  // Device Test & Confirmation
  const [deviceTestResult, setDeviceTestResult] = useState<'working' | 'partially_working' | 'not_working' | null>(
    ticket?.repairDetails?.deviceTestResult || 'working'
  )
  const [customerInformed, setCustomerInformed] = useState(ticket?.repairDetails?.customerConfirmation?.customerInformed || false)
  const [deviceTestedWithCust, setDeviceTestedWithCust] = useState(ticket?.repairDetails?.customerConfirmation?.deviceTestedWithCustomer || false)

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null)

  if (!ticket) {
    return (
      <div className="technician-dashboard">
        <div className="technician-panel jobs-empty">
          <h2>Ticket Not Found</h2>
          <p>The requested service ticket could not be located.</p>
          <Link className="primary-button" to="/technician/jobs">
            Back to All Jobs
          </Link>
        </div>
      </div>
    )
  }

  const statusOrder: JobStatus[] = ['CREATED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'REPAIR_STARTED', 'COMPLETED']
  const currentStatusIndex = statusOrder.indexOf(ticket.status)

  // State transitions
  const handleAcceptJob = () => {
    mockStore.acceptJob(ticket.id)
  }

  const handleStartNavigation = () => {
    mockStore.startTravelJob(ticket.id)
  }

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault()
    setOtpError('')
    if (otpInput.length !== 6 || !/^\d{6}$/.test(otpInput)) {
      setOtpError('Please enter a valid 6-digit numeric OTP.')
      return
    }

    const verified = mockStore.verifyArrivalOtp(ticket.id, otpInput)
    if (verified) {
      setOtpError('')
    } else {
      setOtpError('Invalid OTP code. Please check with the customer and try again.')
    }
  }

  const handleStartRepair = () => {
    mockStore.startRepairJob(ticket.id)
  }

  // Photo handlers
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      if (type === 'before') setBeforePhoto(url)
      else setAfterPhoto(url)
    }
    reader.readAsDataURL(file)
  }

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Completeness check for Complete Repair button
  const allChecklistDone = Object.values(checklist).every(Boolean)
  const isFormValid =
    rootCause.trim().length > 0 &&
    repairPerformed.trim().length > 0 &&
    allChecklistDone &&
    deviceTestResult === 'working' &&
    customerInformed &&
    deviceTestedWithCust

  const handleCompleteRepairSubmit = () => {
    const repairData: RepairDetails = {
      rootCause,
      repairPerformed,
      partsReplaced: partsReplaced || undefined,
      repairNotes: repairNotes || undefined,
      beforeImage: beforePhoto || undefined,
      afterImage: afterPhoto || undefined,
      checklist,
      deviceTestResult,
      customerConfirmation: {
        customerInformed,
        deviceTestedWithCustomer: deviceTestedWithCust,
      },
    }
    mockStore.completeRepairJob(ticket.id, repairData)
    setConfirmModalOpen(false)
  }

  // Google Maps navigation URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.customerAddress)}`

  return (
    <div className="job-details-page">
      {/* 11.1 JOB HEADER */}
      <div className="job-top-bar">
        <Link className="back-link-bold" to="/technician/jobs">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>
        <div className="job-header-details">
          <div>
            <div className="ticket-title-row">
              <span className="section-kicker">SERVICE TICKET</span>
              <span className={`priority-pill ${ticket.priority.toLowerCase()}`}>{ticket.priority} Priority</span>
            </div>
            <h1>{ticket.id} · {ticket.deviceName}</h1>
            <p className="device-category-sub">
              Category: <strong>{ticket.deviceCategory}</strong> · Brand: <strong>{ticket.brand}</strong>
            </p>
          </div>

          <div className="job-header-status-badge">
            <span className="status-label">Current Status</span>
            <span className={`status-pill large ${ticket.status === 'COMPLETED' ? 'success' : 'info'}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="job-status-timeline">
          {statusOrder.map((step, idx) => {
            const isDone = idx < currentStatusIndex
            const isCurrent = idx === currentStatusIndex
            const labels: Record<JobStatus, string> = {
              CREATED: 'Created',
              ACCEPTED: 'Accepted',
              ON_THE_WAY: 'On the Way',
              ARRIVED: 'Arrived',
              REPAIR_STARTED: 'Repair Started',
              COMPLETED: 'Completed',
            }

            return (
              <div
                key={step}
                className={`timeline-step-pill ${isDone ? 'complete' : isCurrent ? 'current' : 'pending'}`}
              >
                <span className="step-bullet">
                  {isDone ? <Check size={12} /> : isCurrent ? '●' : '○'}
                </span>
                <span className="step-name">{labels[step]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="job-details-layout">
        {/* Left Column: Context, Customer, AI history */}
        <div className="job-context-column">
          {/* 11.2 & 11.3 CUSTOMER & LOCATION & CONTACT */}
          <section className="technician-panel">
            <div className="technician-panel-heading">
              <div>
                <span className="section-kicker">CUSTOMER & LOCATION</span>
                <h2>Customer Details</h2>
              </div>
              <span className="avatar customer-avatar">{ticket.customerName.slice(0, 2).toUpperCase()}</span>
            </div>

            <div className="customer-info-card">
              <div className="cust-info-row">
                <User size={17} className="cust-icon" />
                <div>
                  <small>Customer Name</small>
                  <strong>{ticket.customerName}</strong>
                </div>
              </div>

              <div className="cust-info-row">
                <Phone size={17} className="cust-icon" />
                <div>
                  <small>Contact Phone</small>
                  <strong>{ticket.customerPhone}</strong>
                </div>
                <a href={`tel:${ticket.customerPhone}`} className="action-button-call">
                  <Phone size={14} /> Call Customer
                </a>
              </div>

              <div className="cust-info-row">
                <MapPin size={17} className="cust-icon" />
                <div className="address-block">
                  <small>Service Location</small>
                  <strong>{ticket.customerAddress}</strong>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button-nav"
                >
                  <Navigation size={14} /> Navigate to Address
                </a>
              </div>
            </div>
          </section>

          {/* 11.4 PROBLEM DESCRIPTION */}
          <section className="technician-panel">
            <div className="technician-panel-heading">
              <div>
                <span className="section-kicker">ORIGINAL REPORT</span>
                <h2>Problem Description</h2>
              </div>
            </div>
            <div className="verbatim-problem-box">
              <span className="quote-label">Customer's Original Statement:</span>
              <p className="verbatim-text">"{ticket.problemDescription}"</p>
            </div>
          </section>

          {/* 11.5 AI TROUBLESHOOTING HISTORY */}
          <section className="technician-panel">
            <div className="technician-panel-heading">
              <div>
                <span className="section-kicker">AI DIAGNOSTICS</span>
                <h2>AI Troubleshooting Summary</h2>
              </div>
              <Sparkles size={18} className="ai-sparkle-icon" />
            </div>

            {ticket.aiTroubleshooting ? (
              <div className="ai-troubleshoot-dossier">
                <div className="ai-dossier-item">
                  <strong className="dossier-title">Problem Description</strong>
                  <p>{ticket.aiTroubleshooting.problemDescription}</p>
                </div>

                <div className="ai-dossier-item">
                  <strong className="dossier-title">Troubleshooting Steps</strong>
                  <ul className="dossier-list">
                    {ticket.aiTroubleshooting.troubleshootingSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-dossier-item">
                  <strong className="dossier-title">Customer Responses</strong>
                  <ul className="dossier-list responses">
                    {ticket.aiTroubleshooting.customerResponses.map((resp) => (
                      <li key={resp}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-dossier-item highlight-finding">
                  <strong className="dossier-title">Key Findings</strong>
                  <p>{ticket.aiTroubleshooting.keyFindings}</p>
                </div>

                <div className="ai-dossier-item escalation-box">
                  <strong className="dossier-title">Escalation Reason</strong>
                  <p>{ticket.aiTroubleshooting.escalationReason}</p>
                </div>
              </div>
            ) : (
              <p className="empty-copy">No AI troubleshooting history is available for this ticket.</p>
            )}
          </section>

          {/* 11.6 CUSTOMER ATTACHMENTS */}
          <section className="technician-panel">
            <div className="technician-panel-heading">
              <div>
                <span className="section-kicker">CUSTOMER EVIDENCE</span>
                <h2>Customer Attachments</h2>
              </div>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="customer-attachments-grid">
                {ticket.attachments.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="attachment-thumb"
                    onClick={() => setActiveImagePreview(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Attachment ${i + 1}`} />
                    <span className="zoom-hint">
                      <ImageIcon size={14} /> View Photo
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No customer attachments.</p>
            )}
          </section>

          {/* 11.17 CUSTOMER RATING DISPLAY */}
          <section className="technician-panel">
            <div className="technician-panel-heading">
              <div>
                <span className="section-kicker">SERVICE FEEDBACK</span>
                <h2>Customer Rating</h2>
              </div>
              <Star size={18} className="star-icon" />
            </div>

            {ticket.customerRating ? (
              <div className="customer-rating-display">
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={20}
                      fill={s <= ticket.customerRating! ? '#eab308' : 'none'}
                      color={s <= ticket.customerRating! ? '#eab308' : '#cbd5e1'}
                    />
                  ))}
                  <strong className="rating-num">{ticket.customerRating}.0 / 5.0</strong>
                </div>
                {ticket.customerReview && <p className="review-quote">"{ticket.customerReview}"</p>}
              </div>
            ) : (
              <div className="pending-rating-box">
                <Clock size={16} />
                <span>Rating: Pending (Customer will provide feedback after service completion)</span>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Interactive State Execution & Repair Workbench */}
        <div className="job-workbench-column">
          {/* STEP TRANSITION CONTROLS */}

          {/* 1. CREATED -> ACCEPT */}
          {ticket.status === 'CREATED' && (
            <section className="technician-panel action-banner-panel">
              <div className="action-banner-content">
                <span className="action-icon">
                  <CheckCircle size={24} />
                </span>
                <div>
                  <h3>Job Assigned to You</h3>
                  <p>Review customer problem and location. Accept this job to begin service coordination.</p>
                </div>
              </div>
              <button
                type="button"
                className="primary-button full-width-btn"
                onClick={handleAcceptJob}
              >
                <Check size={18} /> Accept Job
              </button>
            </section>
          )}

          {/* 2. ACCEPTED -> ON THE WAY */}
          {ticket.status === 'ACCEPTED' && (
            <section className="technician-panel action-banner-panel">
              <div className="action-banner-content">
                <span className="action-icon">
                  <Navigation size={24} />
                </span>
                <div>
                  <h3>Ready to Travel</h3>
                  <p>Click "On the Way" when you start driving to the customer's home.</p>
                </div>
              </div>
              <button
                type="button"
                className="primary-button full-width-btn"
                onClick={handleStartNavigation}
              >
                <Navigation size={18} /> Start Travel (On the Way)
              </button>
            </section>
          )}

          {/* 3. ON_THE_WAY -> 11.7 ARRIVAL VERIFICATION - OTP */}
          {ticket.status === 'ON_THE_WAY' && (
            <section className="technician-panel otp-panel">
              <div className="technician-panel-heading">
                <div>
                  <span className="section-kicker">STEP 11.7: ARRIVAL VERIFICATION</span>
                  <h2>Customer Arrival OTP Verification</h2>
                </div>
                <KeyRound size={20} className="otp-icon" />
              </div>

              <div className="otp-guidance-box">
                <p>
                  When you reach the customer's premises, ask the customer for the <strong>6-digit OTP</strong> shown on their service ticket.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="otp-form">
                <div className="technician-field">
                  <label htmlFor="otp-input">Enter Customer 6-Digit OTP *</label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="otp-input-field"
                    placeholder="• • • • • •"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                {otpError && (
                  <p className="form-message" role="alert">
                    <AlertCircle size={15} /> {otpError}
                  </p>
                )}

                <button type="submit" className="primary-button full-width-btn">
                  <ShieldCheck size={18} /> Verify Customer Arrival OTP
                </button>
              </form>
            </section>
          )}

          {/* 4. ARRIVED -> 11.8 START REPAIR */}
          {ticket.status === 'ARRIVED' && (
            <section className="technician-panel action-banner-panel success-border">
              <div className="action-banner-content">
                <span className="action-icon success">
                  <CheckCircle2 size={24} />
                </span>
                <div>
                  <h3 className="success-text">Customer Arrival Verified ✓</h3>
                  <p>OTP verified successfully. You can now begin hardware inspection and diagnostic repairs.</p>
                </div>
              </div>
              <button
                type="button"
                className="primary-button full-width-btn"
                onClick={handleStartRepair}
              >
                <Play size={18} /> Start Repair
              </button>
            </section>
          )}

          {/* 5. REPAIR_STARTED -> REPAIR WORKBENCH (11.9 - 11.15) */}
          {ticket.status === 'REPAIR_STARTED' && (
            <section className="technician-panel repair-form-panel">
              <div className="technician-panel-heading">
                <div>
                  <span className="section-kicker">STEP 11.9 - 11.15</span>
                  <h2>Repair Details & Completion</h2>
                </div>
                <Wrench size={20} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (isFormValid) setConfirmModalOpen(true)
                }}
                className="repair-workbench-form"
              >
                {/* 11.9 Repair Details Inputs */}
                <div className="technician-field">
                  <label htmlFor="root-cause">Root Cause Identified *</label>
                  <input
                    id="root-cause"
                    type="text"
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    placeholder="e.g. Blown power regulator capacitor and loose neutral connection"
                    required
                  />
                </div>

                <div className="technician-field">
                  <label htmlFor="repair-performed">Repair Performed *</label>
                  <textarea
                    id="repair-performed"
                    className="experience-summary"
                    rows={3}
                    value={repairPerformed}
                    onChange={(e) => setRepairPerformed(e.target.value)}
                    placeholder="e.g. Replaced power regulation module, re-crimped neutral lead, tested switch actuation"
                    required
                  />
                </div>

                <div className="technician-field">
                  <label htmlFor="parts-replaced">Parts Replaced (Optional)</label>
                  <input
                    id="parts-replaced"
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    placeholder="e.g. Wipro Relay Switch Board (Model: WR-10A)"
                  />
                </div>

                <div className="technician-field">
                  <label htmlFor="repair-notes">Additional Repair Notes (Optional)</label>
                  <textarea
                    id="repair-notes"
                    className="experience-summary"
                    rows={2}
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    placeholder="e.g. Suggested customer use surge protector during lightning storms"
                  />
                </div>

                {/* 11.10 & 11.11 Photo Uploads */}
                <div className="photo-uploads-row">
                  {/* Before Photo */}
                  <div className="photo-upload-box">
                    <label>11.10 Before Repair Photo</label>
                    {beforePhoto ? (
                      <div className="photo-preview-wrap">
                        <img src={beforePhoto} alt="Before repair" />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => setBeforePhoto(null)}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    ) : (
                      <label className="photo-dropzone">
                        <Upload size={20} />
                        <span>Upload Before Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'before')}
                        />
                      </label>
                    )}
                  </div>

                  {/* After Photo */}
                  <div className="photo-upload-box">
                    <label>11.11 After Repair Photo</label>
                    {afterPhoto ? (
                      <div className="photo-preview-wrap">
                        <img src={afterPhoto} alt="After repair" />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => setAfterPhoto(null)}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    ) : (
                      <label className="photo-dropzone">
                        <Camera size={20} />
                        <span>Upload After Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'after')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 11.12 Compact Safety & Repair Checklist */}
                <div className="checklist-container">
                  <label className="section-subtitle-label">11.12 Repair Safety Checklist *</label>
                  <div className="checklist-items-grid">
                    {[
                      ['deviceInspected', 'Device inspected'],
                      ['rootCauseIdentified', 'Root cause identified'],
                      ['repairPerformed', 'Repair performed'],
                      ['deviceTested', 'Device tested'],
                      ['customerInformed', 'Customer informed'],
                      ['workAreaChecked', 'Work area checked & cleaned'],
                    ].map(([key, label]) => (
                      <label key={key} className="checklist-item-row">
                        <input
                          type="checkbox"
                          checked={checklist[key as keyof typeof checklist]}
                          onChange={() => toggleChecklistItem(key as keyof typeof checklist)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 11.13 Device Testing Radio */}
                <div className="device-testing-container">
                  <label className="section-subtitle-label">11.13 Device Testing Result *</label>
                  <div className="test-result-options">
                    <label className={`test-radio ${deviceTestResult === 'working' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="testResult"
                        value="working"
                        checked={deviceTestResult === 'working'}
                        onChange={() => setDeviceTestResult('working')}
                      />
                      <span>✓ Working</span>
                    </label>

                    <label className={`test-radio ${deviceTestResult === 'partially_working' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="testResult"
                        value="partially_working"
                        checked={deviceTestResult === 'partially_working'}
                        onChange={() => setDeviceTestResult('partially_working')}
                      />
                      <span>Partially Working</span>
                    </label>

                    <label className={`test-radio ${deviceTestResult === 'not_working' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="testResult"
                        value="not_working"
                        checked={deviceTestResult === 'not_working'}
                        onChange={() => setDeviceTestResult('not_working')}
                      />
                      <span>Not Working</span>
                    </label>
                  </div>
                  {deviceTestResult !== 'working' && (
                    <small className="field-error">
                      Note: "Complete Repair" requires device to be in working condition.
                    </small>
                  )}
                </div>

                {/* 11.14 Customer Confirmation Checkboxes */}
                <div className="customer-confirmation-box">
                  <label className="section-subtitle-label">11.14 Customer Confirmation *</label>
                  <div className="confirmation-items">
                    <label className="choice">
                      <input
                        type="checkbox"
                        checked={customerInformed}
                        onChange={(e) => setCustomerInformed(e.target.checked)}
                      />
                      <span>Customer informed of repair details & warranty</span>
                    </label>

                    <label className="choice">
                      <input
                        type="checkbox"
                        checked={deviceTestedWithCust}
                        onChange={(e) => setDeviceTestedWithCust(e.target.checked)}
                      />
                      <span>Device tested together with customer</span>
                    </label>
                  </div>
                </div>

                {/* 11.15 Complete Repair Button */}
                <div className="submit-repair-action">
                  <button
                    type="submit"
                    className="primary-button full-width-btn"
                    disabled={!isFormValid}
                  >
                    <CheckCircle2 size={18} /> Complete Repair
                  </button>
                  {!isFormValid && (
                    <small className="validation-note">
                      Please complete root cause, repair performed, all checklist items, device working test, and customer confirmation to enable completion.
                    </small>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* 6. COMPLETED -> 11.16 AFTER COMPLETION SUMMARY */}
          {ticket.status === 'COMPLETED' && (
            <section className="technician-panel completion-summary-panel">
              <div className="completed-banner-head">
                <CheckCircle2 size={32} className="success-icon" />
                <div>
                  <h2>✓ Repair Completed</h2>
                  <p>Ticket: <strong>{ticket.id}</strong> · Status: <strong>Completed</strong></p>
                </div>
              </div>

              <div className="completed-summary-grid">
                <div className="review-item">
                  <span>Root Cause</span>
                  <strong>{ticket.repairDetails?.rootCause || rootCause || 'Power board defect'}</strong>
                </div>

                <div className="review-item">
                  <span>Repair Performed</span>
                  <strong>{ticket.repairDetails?.repairPerformed || repairPerformed || 'Replaced capacitor and switch module'}</strong>
                </div>

                {(ticket.repairDetails?.partsReplaced || partsReplaced) && (
                  <div className="review-item">
                    <span>Parts Replaced</span>
                    <strong>{ticket.repairDetails?.partsReplaced || partsReplaced}</strong>
                  </div>
                )}

                {(ticket.repairDetails?.repairNotes || repairNotes) && (
                  <div className="review-item">
                    <span>Repair Notes</span>
                    <strong>{ticket.repairDetails?.repairNotes || repairNotes}</strong>
                  </div>
                )}

                <div className="review-item">
                  <span>Device Test Result</span>
                  <strong className="success-text">✓ Working & Verified</strong>
                </div>

                <div className="review-item">
                  <span>Completed At</span>
                  <strong>{new Date().toLocaleDateString('en-IN')}</strong>
                </div>
              </div>

              {/* Photos Summary */}
              <div className="completed-photos-row">
                {(ticket.repairDetails?.beforeImage || beforePhoto) && (
                  <div className="summary-photo-card">
                    <span>Before Repair</span>
                    <img src={ticket.repairDetails?.beforeImage || beforePhoto!} alt="Before" />
                  </div>
                )}
                {(ticket.repairDetails?.afterImage || afterPhoto) && (
                  <div className="summary-photo-card">
                    <span>After Repair</span>
                    <img src={ticket.repairDetails?.afterImage || afterPhoto!} alt="After" />
                  </div>
                )}
              </div>

              <Link className="outline-button full-width-btn" to="/technician/jobs">
                Back to All Jobs
              </Link>
            </section>
          )}
        </div>
      </div>

      {/* MODAL: 11.15 COMPLETE REPAIR CONFIRMATION */}
      {confirmModalOpen && (
        <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="complete-modal-title">
          <div className="ticket-modal">
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setConfirmModalOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="review-modal-header">
              <span className="ai-entry-icon">
                <CheckCircle2 size={24} />
              </span>
              <div>
                <h2 id="complete-modal-title">Complete Repair?</h2>
                <p>Are you sure the repair has been completed and the device has been tested?</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleCompleteRepairSubmit}
              >
                <Check size={16} /> Confirm Complete Repair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE PREVIEW */}
      {activeImagePreview && (
        <div
          className="ticket-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="image-zoom-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={() => setActiveImagePreview(null)}
            >
              <X size={18} />
            </button>
            <img src={activeImagePreview} alt="Zoomed preview" />
          </div>
        </div>
      )}
    </div>
  )
}
