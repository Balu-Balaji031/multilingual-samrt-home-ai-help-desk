import { mockStore } from '../services/mockStore'
import { mockTechnician, type TechnicianProfile } from '../mocks/technicianData'

export async function updateTechnicianProfile(profile: TechnicianProfile) {
  await new Promise((resolve) => setTimeout(resolve, 450))
  Object.assign(mockTechnician, profile)
  mockStore.updateTechnicianProfile(profile)
  return mockTechnician
}
