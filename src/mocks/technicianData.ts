export type TechnicianStatus =
  | 'profile_pending'
  | 'under_review'
  | 'assessment_assigned'
  | 'assessment_pending'
  | 'assessment_passed'
  | 'approved'
  | 'reassessment'

export interface TechnicianProfile {
  name: string
  email: string
  mobile: string
  status: TechnicianStatus
  experience: string | null
  experienceSummary: string
  specializations: string[]
  skills: string[]
  specialization: string | null
  languages: string[]
  serviceArea: string | null
  city: string
  state: string
  pincodes: string[]
  serviceRadiusKm: number | null
  availability: string | null
  workingDays: string[]
  workingHours: { start: string; end: string } | null
}

export const mockTechnician: TechnicianProfile = {
  name: 'Mark Kumar',
  email: 'technician@example.com',
  mobile: '+91 98765 43210',
  status: 'profile_pending',
  experience: null,
  experienceSummary: '',
  specializations: [],
  skills: [],
  specialization: null,
  languages: [],
  serviceArea: null,
  city: '',
  state: '',
  pincodes: [],
  serviceRadiusKm: null,
  availability: null,
  workingDays: [],
  workingHours: null,
}
