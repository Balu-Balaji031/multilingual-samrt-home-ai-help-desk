import { mockStore } from '../services/mockStore'
import type { TechnicianProfile } from '../mocks/technicianData'
import type { CustomerTicket, RepairDetails, TechnicianApplication } from '../types/technicianPortal'

export async function submitTechnicianApplication(): Promise<TechnicianApplication> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockStore.submitApplication()
}

export async function saveTechnicianProfile(profile: Partial<TechnicianProfile>): Promise<TechnicianProfile> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  mockStore.updateTechnicianProfile(profile)
  return mockStore.getState().technicianProfile
}

export async function acceptAssignedJob(ticketId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  mockStore.acceptJob(ticketId)
}

export async function startTravelToCustomer(ticketId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  mockStore.startTravelJob(ticketId)
}

export async function verifyCustomerArrivalOtp(ticketId: string, otp: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockStore.verifyArrivalOtp(ticketId, otp)
}

export async function startDeviceRepair(ticketId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  mockStore.startRepairJob(ticketId)
}

export async function finishDeviceRepair(ticketId: string, repairDetails: RepairDetails): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  mockStore.completeRepairJob(ticketId, repairDetails)
}

export async function fetchTechnicianTickets(technicianId = 'TECH-MK-01'): Promise<CustomerTicket[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const tickets = mockStore.getState().tickets
  return tickets.filter((ticket) => ticket.assignedTechnicianId === technicianId)
}

