export type TechnicianApplicationStatus =
  | 'profile_pending'
  | 'ready_to_submit'
  | 'pending_review'
  | 'changes_requested'
  | 'rejected'
  | 'approved_for_assessment'
  | 'assessment_scheduled'
  | 'assessment_passed'
  | 'assessment_failed'
  | 'approved'

export interface AssessmentCenter {
  id: string
  name: string
  address: string
  city: string
  state: string
  contactPhone?: string
}

export interface AssessmentDetails {
  centerId: string
  centerName: string
  address: string
  specialization: string
  date: string // DD/MM/YYYY or YYYY-MM-DD
  time: string // e.g. 10:00 AM
  instructions: string
  score?: number
  evaluatorNotes?: string
  result?: 'pass' | 'fail'
  scheduledAt: string
  completedAt?: string
}

export interface TechnicianApplication {
  applicationId: string
  technicianId: string
  submittedAt: string
  status: TechnicianApplicationStatus
  adminNote?: string
  rejectionReason?: string
  assessment?: AssessmentDetails
}

export type JobStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'REPAIR_STARTED'
  | 'COMPLETED'

export interface AITroubleshootingHistory {
  problemDescription: string
  troubleshootingSteps: string[]
  customerResponses: string[]
  keyFindings: string
  escalationReason: string
}

export interface RepairChecklist {
  deviceInspected: boolean
  rootCauseIdentified: boolean
  repairPerformed: boolean
  deviceTested: boolean
  customerInformed: boolean
  workAreaChecked: boolean
}

export interface CustomerConfirmation {
  customerInformed: boolean
  deviceTestedWithCustomer: boolean
}

export interface RepairDetails {
  rootCause: string
  repairPerformed: string
  partsReplaced?: string
  repairNotes?: string
  beforeImage?: string
  afterImage?: string
  checklist: RepairChecklist
  deviceTestResult: 'working' | 'partially_working' | 'not_working' | null
  customerConfirmation: CustomerConfirmation
  completedAt?: string
}

export interface CustomerTicket {
  id: string // e.g. 'TKT-54112271'
  deviceId?: string
  deviceName: string // e.g. 'Smart Switch'
  deviceCategory: string // e.g. 'smart switch'
  brand: string
  problemDescription: string // Customer's verbatim report e.g. "it will no oning"
  customerName: string // e.g. "Sweaty"
  customerPhone: string // e.g. "6308307088"
  customerAddress: string // e.g. "4-46, Roddam, Roddam, Andhra Pradesh 515123"
  customerLocation: string // e.g. "Roddam, Andhra Pradesh"
  customerLanguage: string // e.g. "Telugu"
  priority: 'Low' | 'Medium' | 'High' | 'Emergency'
  createdAt: string
  assignedTechnicianId?: string
  assignedTechnicianName?: string
  status: JobStatus
  otp: string // 6-digit verification code e.g. "584920"
  otpVerified: boolean
  aiTroubleshooting?: AITroubleshootingHistory
  attachments?: string[]
  repairDetails?: RepairDetails
  customerRating?: number | null
  customerReview?: string
}

export interface TechnicianNotificationSettings {
  newJobAssignments: boolean
  jobStatusUpdates: boolean
  assessmentUpdates: boolean
  applicationUpdates: boolean
  adminMessages: boolean
  repairReminders: boolean
  systemNotifications: boolean
}

export interface TechnicianSettings {
  notifications: TechnicianNotificationSettings
  appLanguage: 'en' | 'ta' | 'te' | 'hi'
  preferredContactMethod: 'phone' | 'sms' | 'email'
  preferredJobTypes: string[]
  notifyOutsidePreferredHours: boolean
  preferredMaxJobDistanceKm: number
  jobAssignmentNotifications: boolean
}

export const defaultTechnicianSettings: TechnicianSettings = {
  notifications: {
    newJobAssignments: true,
    jobStatusUpdates: true,
    assessmentUpdates: true,
    applicationUpdates: true,
    adminMessages: true,
    repairReminders: true,
    systemNotifications: true,
  },
  appLanguage: 'en',
  preferredContactMethod: 'phone',
  preferredJobTypes: ['Installation', 'Repair', 'Troubleshooting'],
  notifyOutsidePreferredHours: false,
  preferredMaxJobDistanceKm: 15,
  jobAssignmentNotifications: true,
}

