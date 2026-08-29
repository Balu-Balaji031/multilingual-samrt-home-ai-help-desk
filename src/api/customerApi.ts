import { activeTicket, completedTickets, devices, mockCustomerProfile, recentActivity, type CustomerProfile } from '../mocks/customerData'

export async function getCustomerOverview() {
  return { devices, activeTicket, completedTickets, recentActivity }
}

export async function addCustomerDevice(device: { name: string; brand: string; location: string }) {
  return { id: `device-${Date.now()}`, ...device, status: 'Registered', warranty: 'Active', icon: 'device' }
}

export async function updateCustomerProfile(profile: CustomerProfile) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  Object.assign(mockCustomerProfile, profile, { location: `${profile.city}, ${profile.state}` })
  return mockCustomerProfile
}
