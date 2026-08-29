import { Check, Edit3, ShieldCheck, X } from 'lucide-react'
import type { TechnicianProfile } from '../../mocks/technicianData'

interface ApplicationReviewModalProps {
  profile: TechnicianProfile
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onSubmit: () => void
  submitting: boolean
  missingFields: string[]
}

export function ApplicationReviewModal({
  profile,
  isOpen,
  onClose,
  onEdit,
  onSubmit,
  submitting,
  missingFields,
}: ApplicationReviewModalProps) {
  if (!isOpen) return null

  const isComplete = missingFields.length === 0

  return (
    <div className="ticket-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="review-app-title">
      <div className="ticket-modal review-application-modal">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="review-modal-header">
          <span className="ai-entry-icon">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h2 id="review-app-title">Review Application</h2>
            <p>Please review your professional details before submitting to Admin for review.</p>
          </div>
        </div>

        {!isComplete && (
          <div className="validation-warning-banner" role="alert">
            <strong>Please complete the following before submitting:</strong>
            <ul>
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="review-modal-content">
          {/* Personal Information */}
          <section className="review-section">
            <h3>Personal Information</h3>
            <div className="review-grid">
              <div className="review-item">
                <span>Full Name</span>
                <strong>{profile.name || 'Not provided'}</strong>
              </div>
              <div className="review-item">
                <span>Email Address</span>
                <strong>{profile.email || 'Not provided'}</strong>
              </div>
              <div className="review-item">
                <span>Mobile Number</span>
                <strong>{profile.mobile || 'Not provided'}</strong>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="review-section">
            <h3>Professional Information</h3>
            <div className="review-grid">
              <div className="review-item">
                <span>Experience</span>
                <strong>{profile.experience ? `${profile.experience} years` : 'Not provided'}</strong>
              </div>
              <div className="review-item">
                <span>Specializations</span>
                <strong>{profile.specializations.length > 0 ? profile.specializations.join(', ') : 'Not selected'}</strong>
              </div>
              <div className="review-item">
                <span>Categories / Skills</span>
                <strong>{profile.skills.length > 0 ? profile.skills.join(', ') : 'None selected'}</strong>
              </div>
              <div className="review-item">
                <span>Languages</span>
                <strong>{profile.languages.length > 0 ? profile.languages.join(', ') : 'Not selected'}</strong>
              </div>
            </div>
          </section>

          {/* Service Area */}
          <section className="review-section">
            <h3>Service Area</h3>
            <div className="review-grid">
              <div className="review-item">
                <span>City</span>
                <strong>{profile.city || 'Not provided'}</strong>
              </div>
              <div className="review-item">
                <span>State</span>
                <strong>{profile.state || 'Not provided'}</strong>
              </div>
              <div className="review-item">
                <span>Pincodes</span>
                <strong>{profile.pincodes.length > 0 ? profile.pincodes.join(', ') : 'Not provided'}</strong>
              </div>
              <div className="review-item">
                <span>Service Radius</span>
                <strong>{profile.serviceRadiusKm ? `${profile.serviceRadiusKm} km` : 'Not selected'}</strong>
              </div>
            </div>
          </section>

          {/* Availability */}
          <section className="review-section">
            <h3>Availability</h3>
            <div className="review-grid">
              <div className="review-item">
                <span>Working Days</span>
                <strong>{profile.workingDays.length > 0 ? profile.workingDays.join(', ') : 'Not selected'}</strong>
              </div>
              <div className="review-item">
                <span>Working Hours</span>
                <strong>
                  {profile.workingHours?.start && profile.workingHours?.end
                    ? `${profile.workingHours.start} - ${profile.workingHours.end}`
                    : 'Not set'}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-actions review-actions">
          <button className="secondary-button" type="button" onClick={onEdit}>
            <Edit3 size={15} /> Edit Profile
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={!isComplete || submitting}
            onClick={onSubmit}
          >
            {submitting ? 'Submitting Application...' : (
              <>
                <Check size={16} /> Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

