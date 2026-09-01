# SmartAssist Data Models

## CustomerProfile

Source: src/mocks/customerData.ts

Fields:
- name: string
- email: string
- mobile: string
- address1: string
- address2?: string
- city: string
- state: string
- pincode: string
- landmark: string
- language: 'en' | 'ta' | 'te'
- profilePhoto?: string
- location: string
- registeredDate?: string
- accountStatus?: 'Active' | 'Inactive'
- lastLogin?: string
- preferredLanguage?: string
- password?: string

Current usage:
- customer dashboard
- profile page
- login validation
- localStorage seed data

Future backend table candidate:
- customers or profiles

## Device

Source: src/mocks/customerData.ts and src/mocks/deviceCatalog.ts

Fields:
- id: string
- name: string
- brand: string
- model: string
- location: string
- status: string
- warranty: string
- icon: string
- category: string

Future backend table candidate:
- devices
- device_catalog

## TechnicianProfile

Source: src/mocks/technicianData.ts

Fields:
- name: string
- email: string
- mobile: string
- status: TechnicianStatus
- experience: string | null
- experienceSummary: string
- specializations: string[]
- skills: string[]
- specialization: string | null
- languages: string[]
- serviceArea: string | null
- city: string
- state: string
- pincodes: string[]
- serviceRadiusKm: number | null
- availability: string | null
- workingDays: string[]
- workingHours: { start: string; end: string } | null

Future backend table candidate:
- technicians
- technician_profiles

## TechnicianApplication

Source: src/types/technicianPortal.ts

Fields:
- applicationId: string
- technicianId: string
- submittedAt: string
- status: TechnicianApplicationStatus
- adminNote?: string
- rejectionReason?: string
- assessment?: AssessmentDetails

Future backend table candidate:
- technician_applications

## AssessmentDetails

Fields:
- centerId: string
- centerName: string
- address: string
- specialization: string
- date: string
- time: string
- instructions: string
- score?: number
- evaluatorNotes?: string
- result?: 'pass' | 'fail'
- scheduledAt: string
- completedAt?: string

Future backend table candidate:
- assessments

## CustomerTicket

Source: src/types/technicianPortal.ts

Fields:
- id: string
- deviceId?: string
- deviceName: string
- deviceCategory: string
- brand: string
- problemDescription: string
- customerName: string
- customerPhone: string
- customerAddress: string
- customerLocation: string
- customerLanguage: string
- priority: 'Low' | 'Medium' | 'High' | 'Emergency'
- createdAt: string
- assignedTechnicianId?: string
- assignedTechnicianName?: string
- status: JobStatus
- otp: string
- otpVerified: boolean
- aiTroubleshooting?: AITroubleshootingHistory
- attachments?: string[]
- repairDetails?: RepairDetails
- customerRating?: number | null
- customerReview?: string

Future backend table candidate:
- tickets
- ticket_status_history
- ticket_assignments

## AITroubleshootingHistory

Fields:
- problemDescription: string
- troubleshootingSteps: string[]
- customerResponses: string[]
- keyFindings: string
- escalationReason: string

Future backend table candidate:
- ai_troubleshooting_sessions
- ai_messages

## RepairDetails

Fields:
- rootCause: string
- repairPerformed: string
- partsReplaced?: string
- repairNotes?: string
- beforeImage?: string
- afterImage?: string
- checklist: RepairChecklist
- deviceTestResult: 'working' | 'partially_working' | 'not_working' | null
- customerConfirmation: CustomerConfirmation
- completedAt?: string

Future backend table candidate:
- repair_details

## TechnicianSettings

Fields:
- notifications: TechnicianNotificationSettings
- appLanguage: 'en' | 'ta' | 'te' | 'hi'
- preferredContactMethod: 'phone' | 'sms' | 'email'
- preferredJobTypes: string[]
- notifyOutsidePreferredHours: boolean
- preferredMaxJobDistanceKm: number
- jobAssignmentNotifications: boolean

Future backend table candidate:
- technician_settings

## CustomerNotification

Fields:
- id: string
- type: 'service' | 'ai' | 'account'
- title: string
- description: string
- timestamp: string
- read: boolean

Future backend table candidate:
- notifications

## Admin Profile State

Current admin state stored in component local state only.
Fields:
- name
- email
- mobile
- role

Future backend table candidate:
- admins

## Auth Types

Source: src/types/auth.ts
- UserRole: 'customer' | 'electrician' | 'admin'
- Language: 'en' | 'ta' | 'te'
- VerificationStatus: approval status values
- Session: basic session shape

Future backend table candidate:
- auth sessions
- users
