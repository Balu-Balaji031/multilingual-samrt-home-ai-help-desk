import { mockStore } from '../services/mockStore'
import type { AssessmentDetails, CustomerTicket, TechnicianApplication } from '../types/technicianPortal'
import type { TechnicianProfile } from '../mocks/technicianData'

export interface SuitableTechnician {
  id: string
  name: string
  specialization: string
  skills: string[]
  languages: string[]
  serviceArea: string
  availability: string
  status: string
  rating?: number
}

export async function getAdminApplications(): Promise<{
  application: TechnicianApplication | null
  profile: TechnicianProfile
}> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const state = mockStore.getState()
  return {
    application: state.application,
    profile: state.technicianProfile,
  }
}

export async function adminRequestChanges(note: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  mockStore.requestChanges(note)
}

export async function adminRejectApplication(reason: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  mockStore.rejectApplication(reason)
}

export async function adminApproveForAssessment(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  mockStore.approveForAssessment()
}

export async function adminAssignAssessment(details: Omit<AssessmentDetails, 'scheduledAt'>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  mockStore.assignAssessment(details)
}

export async function adminRecordAssessmentResult(
  score: number,
  notes: string,
  result: 'pass' | 'fail'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  mockStore.recordAssessmentResult(score, notes, result)
}

export async function adminFinalApproveTechnician(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  mockStore.finalApproveTechnician()
}

export async function adminGetSuitableTechnicians(ticket: CustomerTicket): Promise<SuitableTechnician[]> {
  void ticket
  await new Promise((resolve) => setTimeout(resolve, 200))
  const state = mockStore.getState()
  const profile = state.technicianProfile
  const app = state.application

  // Only approved technicians who completed verification are eligible
  if (app?.status !== 'approved' && profile.status !== 'approved') {
    return []
  }

  return [
    {
      id: 'TECH-MK-01',
      name: profile.name,
      specialization: profile.specializations.join(', ') || profile.specialization || 'Smart Home Installation',
      skills: profile.skills,
      languages: profile.languages,
      serviceArea: profile.serviceArea || `${profile.city}, ${profile.state}`,
      availability: profile.availability || 'Available',
      status: 'Eligible for Jobs',
      rating: 4.9,
    },
  ]
}

export async function adminAssignTicket(ticketId: string, technicianId: string, technicianName: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  mockStore.assignTicketToTechnician(ticketId, technicianId, technicianName)
}

export async function adminSubmitCustomerRating(ticketId: string, rating: number, review?: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  mockStore.rateTechnician(ticketId, rating, review)
}

