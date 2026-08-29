import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  MapPin,
  Ticket,
  User,
} from 'lucide-react'
import { useMockStore } from '../../services/mockStore'
import type { JobStatus } from '../../types/technicianPortal'

type FilterOption = 'ALL' | JobStatus

export function TechnicianJobsList() {
  const navigate = useNavigate()
  const state = useMockStore()
  const [filter, setFilter] = useState<FilterOption>('ALL')

  const profile = state.technicianProfile
  const app = state.application
  const isApproved = app?.status === 'approved' || profile.status === 'approved'

  // Filter only tickets assigned to Mark Kumar (TECH-MK-01)
  const myTickets = state.tickets.filter((t) => t.assignedTechnicianId === 'TECH-MK-01')

  const visibleTickets =
    filter === 'ALL' ? myTickets : myTickets.filter((t) => t.status === filter)

  const filterTabs: { label: string; value: FilterOption; count: number }[] = [
    { label: 'All', value: 'ALL', count: myTickets.length },
    { label: 'Created', value: 'CREATED', count: myTickets.filter((t) => t.status === 'CREATED').length },
    { label: 'Accepted', value: 'ACCEPTED', count: myTickets.filter((t) => t.status === 'ACCEPTED').length },
    { label: 'On the Way', value: 'ON_THE_WAY', count: myTickets.filter((t) => t.status === 'ON_THE_WAY').length },
    { label: 'Arrived', value: 'ARRIVED', count: myTickets.filter((t) => t.status === 'ARRIVED').length },
    { label: 'Repair Started', value: 'REPAIR_STARTED', count: myTickets.filter((t) => t.status === 'REPAIR_STARTED').length },
    { label: 'Completed', value: 'COMPLETED', count: myTickets.filter((t) => t.status === 'COMPLETED').length },
  ]

  return (
    <div className="technician-dashboard all-jobs-page-wrapper">
      <div className="technician-welcome jobs-page-header">
        <div>
          <span className="section-kicker">MY SERVICE ASSIGNMENTS</span>
          <h1>All Jobs</h1>
          <p>
            View and manage all customer tickets assigned to you. Follow each step from acceptance to verified repair completion.
          </p>
        </div>
      </div>

      {!isApproved ? (
        <section className="technician-panel jobs-empty">
          <div className="empty-job-icon">
            <AlertTriangle size={24} />
          </div>
          <h2>Professional Verification Incomplete</h2>
          <p>
            You must complete your application, assessment, and receive Admin Approval before you can receive service assignments.
          </p>
          <Link className="primary-button compact-button" to="/technician/dashboard">
            Check Application Status <ArrowRight size={15} />
          </Link>
        </section>
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="ticket-tabs jobs-filter-tabs" role="tablist" aria-label="Job status filters">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={filter === tab.value}
                className={filter === tab.value ? 'active' : ''}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Jobs List */}
          {visibleTickets.length === 0 ? (
            <section className="technician-panel jobs-empty">
              <div className="empty-job-icon">
                <Ticket size={24} />
              </div>
              <h2>No jobs in this category</h2>
              <p>
                {filter === 'ALL'
                  ? 'No service jobs are currently assigned to you. When Admin assigns tickets, they will appear here.'
                  : `There are currently no tickets with status "${filter.replace('_', ' ')}".`}
              </p>
              {filter !== 'ALL' && (
                <button className="secondary-button" onClick={() => setFilter('ALL')}>
                  Show All Jobs
                </button>
              )}
            </section>
          ) : (
            <div className="technician-jobs-grid">
              {visibleTickets.map((ticket) => (
                <article key={ticket.id} className="technician-job-card">
                  <div className="job-card-top">
                    <div>
                      <span className="ticket-id-tag">
                        <Ticket size={13} /> {ticket.id}
                      </span>
                      <h3>{ticket.deviceName}</h3>
                    </div>
                    <div className="job-card-badges">
                      <span className={`priority-pill ${ticket.priority.toLowerCase()}`}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`status-pill ${ticket.status === 'COMPLETED' ? 'success' : 'info'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="job-issue-text">
                    <em>Issue:</em> "{ticket.problemDescription}"
                  </p>

                  <div className="job-card-meta-grid">
                    <div className="meta-cell">
                      <User size={13} />
                      <span>{ticket.customerName}</span>
                    </div>
                    <div className="meta-cell">
                      <MapPin size={13} />
                      <span>{ticket.customerLocation}</span>
                    </div>
                    <div className="meta-cell">
                      <Calendar size={13} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <button
                      type="button"
                      className="primary-button compact-button full-width-btn"
                      onClick={() => navigate(`/technician/jobs/${ticket.id}`)}
                    >
                      View Job Details <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
