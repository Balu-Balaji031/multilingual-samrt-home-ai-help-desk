export type UserRole = 'customer' | 'electrician' | 'admin'

export type Language = 'en' | 'ta' | 'te'

export type VerificationStatus =
  | 'pending'
  | 'assessment_scheduled'
  | 'assessment_completed'
  | 'admin_review'
  | 'approved'
  | 'rejected'
  | 'suspended'

export interface Session {
  id: string
  deviceLabel: string
  lastActiveAt: string
  current: boolean
}
