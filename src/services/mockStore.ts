import { useSyncExternalStore } from 'react'
import type { TechnicianProfile } from '../mocks/technicianData'
import type {
  AssessmentCenter,
  AssessmentDetails,
  CustomerTicket,
  RepairDetails,
  TechnicianApplication,
  TechnicianApplicationStatus,
  TechnicianSettings,
} from '../types/technicianPortal'
import { defaultTechnicianSettings } from '../types/technicianPortal'

const STORAGE_KEY = 'smartassist_portal_store_v1'
const SETTINGS_KEY = 'technician_settings'

export interface PortalStoreState {
  technicianProfile: TechnicianProfile
  application: TechnicianApplication | null
  assessmentCenters: AssessmentCenter[]
  tickets: CustomerTicket[]
  technicianSettings: TechnicianSettings
}

const defaultCenters: AssessmentCenter[] = [
  {
    id: 'center-1',
    name: 'SmartHome Service Center (South)',
    address: '12/A Mount Road, Anna Salai, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    contactPhone: '+91 44 2855 0100',
  },
  {
    id: 'center-2',
    name: 'SmartTech Assessment Hub',
    address: 'Plot 45, Hitec City Main Rd, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    contactPhone: '+91 40 6712 3456',
  },
  {
    id: 'center-3',
    name: 'NextGen IoT Evaluation Lab',
    address: '88 Industrial Area Phase II, Peenya',
    city: 'Bengaluru',
    state: 'Karnataka',
    contactPhone: '+91 80 4122 8900',
  },
]

const initialProfile: TechnicianProfile = {
  name: 'Mark Kumar',
  email: 'mark.kumar@smartassist.ai',
  mobile: '+91 98765 43210',
  status: 'profile_pending',
  experience: '3',
  experienceSummary: 'Certified smart home technician with 3 years of residential and commercial IoT device installation, CCTV security setup, and electrical troubleshooting experience.',
  specializations: ['Smart Home Installation', 'CCTV & Security'],
  skills: ['Smart Lighting', 'Smart Sensors', 'Smart Security', 'Smart Locks', 'Smart Home Automation', 'Smart Device Setup', 'Security Camera Installation', 'DVR / NVR Setup'],
  specialization: 'Smart Home Installation',
  languages: ['English', 'Tamil', 'Telugu'],
  serviceArea: 'Chennai, Tamil Nadu',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincodes: ['600028', '600018', '600020', '600004'],
  serviceRadiusKm: 25,
  availability: '09:00 - 18:00',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  workingHours: { start: '09:00', end: '18:00' },
}

const initialTickets: CustomerTicket[] = [
  {
    id: 'TKT-54112271',
    deviceId: 'sw-01',
    deviceName: 'Smart Switch',
    deviceCategory: 'smart switch',
    brand: 'Wipro Smart',
    problemDescription: 'it will no oning',
    customerName: 'Sweaty',
    customerPhone: '6308307088',
    customerAddress: '4-46, Roddam, Roddam, Andhra Pradesh 515123',
    customerLocation: 'Roddam, Andhra Pradesh',
    customerLanguage: 'Telugu',
    priority: 'Medium',
    createdAt: '2026-08-29T10:15:00Z',
    status: 'CREATED',
    otp: '584920',
    otpVerified: false,
    aiTroubleshooting: {
      problemDescription: 'The customer reports that their smart switch is completely unresponsive.',
      troubleshootingSteps: [
        'Verified physical switch position',
        'Checked status indicators',
        'Checked circuit breaker',
        'Confirmed device is receiving power',
      ],
      customerResponses: [
        'Customer confirmed: Switch indicator LED is completely dark.',
        'Customer confirmed: Breaker reset did not restore device power.',
      ],
      keyFindings: 'The switch remains non-functional after basic checks.',
      escalationReason: 'The problem persists and requires physical inspection.',
    },
    attachments: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'TKT-04556292',
    deviceId: 'cam-02',
    deviceName: 'Smart Security Camera',
    deviceCategory: 'cctv & security',
    brand: 'Xiaomi',
    problemDescription: 'Camera is not powering on after rain storm',
    customerName: 'Rx 100',
    customerPhone: '+91 98765 43210',
    customerAddress: '24 Lake View Road, Adyar, Chennai 600028',
    customerLocation: 'Chennai, Tamil Nadu',
    customerLanguage: 'English',
    priority: 'High',
    createdAt: '2026-08-28T14:30:00Z',
    status: 'CREATED',
    otp: '839201',
    otpVerified: false,
    aiTroubleshooting: {
      problemDescription: 'Security camera outdoor unit unresponsive after weather event.',
      troubleshootingSteps: [
        'Checked power adapter cable connection',
        'Tested wall socket with another appliance',
        'Attempted reset button press for 10 seconds',
      ],
      customerResponses: [
        'Adapter is plugged in firmly, power outlet is active.',
        'Reset button provides no beep response.',
      ],
      keyFindings: 'Outdoor power supply or surge protector likely tripped/damaged.',
      escalationReason: 'Requires technician on-site voltage test and potential power supply replacement.',
    },
    attachments: [],
  },
]

function getInitialState(): PortalStoreState {
  let settings = defaultTechnicianSettings
  try {
    const rawSettings = localStorage.getItem(SETTINGS_KEY)
    if (rawSettings) {
      const parsedSettings = JSON.parse(rawSettings)
      settings = {
        ...defaultTechnicianSettings,
        ...parsedSettings,
        notifications: {
          ...defaultTechnicianSettings.notifications,
          ...(parsedSettings.notifications || {}),
        },
      }
    }
  } catch (err) {
    console.error('Error loading settings from localStorage:', err)
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        technicianProfile: parsed.technicianProfile || initialProfile,
        application: parsed.application || null,
        assessmentCenters: parsed.assessmentCenters || defaultCenters,
        tickets: parsed.tickets || initialTickets,
        technicianSettings: parsed.technicianSettings || settings,
      }
    }
  } catch (err) {
    console.error('Error loading store from localStorage:', err)
  }
  return {
    technicianProfile: initialProfile,
    application: null,
    assessmentCenters: defaultCenters,
    tickets: initialTickets,
    technicianSettings: settings,
  }
}

let currentState: PortalStoreState = getInitialState()
const listeners = new Set<() => void>()

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentState.technicianSettings))
  } catch (err) {
    console.error('Error saving store to localStorage:', err)
  }
  listeners.forEach((listener) => listener())
}

export const mockStore = {
  getState(): PortalStoreState {
    return currentState
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // Technician Actions
  updateTechnicianProfile(profile: Partial<TechnicianProfile>) {
    currentState = {
      ...currentState,
      technicianProfile: {
        ...currentState.technicianProfile,
        ...profile,
      },
    }
    saveState()
  },

  updateTechnicianSettings(settings: Partial<TechnicianSettings>) {
    currentState = {
      ...currentState,
      technicianSettings: {
        ...currentState.technicianSettings,
        ...settings,
        notifications: {
          ...currentState.technicianSettings.notifications,
          ...(settings.notifications || {}),
        },
      },
    }
    saveState()
    return currentState.technicianSettings
  },

  resetTechnicianSettings() {
    currentState = {
      ...currentState,
      technicianSettings: {
        ...defaultTechnicianSettings,
        notifications: { ...defaultTechnicianSettings.notifications },
        preferredJobTypes: [...defaultTechnicianSettings.preferredJobTypes],
      },
    }
    saveState()
    return currentState.technicianSettings
  },

  submitApplication(): TechnicianApplication {
    const appId = currentState.application?.applicationId || `APP-${Math.floor(1000000 + Math.random() * 9000000)}`
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const updatedApp: TechnicianApplication = {
      applicationId: appId,
      technicianId: 'TECH-MK-01',
      submittedAt: now,
      status: 'pending_review',
      adminNote: undefined,
      rejectionReason: undefined,
      assessment: currentState.application?.assessment,
    }

    currentState = {
      ...currentState,
      application: updatedApp,
      technicianProfile: {
        ...currentState.technicianProfile,
        status: 'under_review',
      },
    }
    saveState()
    return updatedApp
  },

  // Admin Actions
  requestChanges(adminNote: string) {
    if (!currentState.application) return
    currentState = {
      ...currentState,
      application: {
        ...currentState.application,
        status: 'changes_requested',
        adminNote,
      },
      technicianProfile: {
        ...currentState.technicianProfile,
        status: 'profile_pending',
      },
    }
    saveState()
  },

  rejectApplication(rejectionReason: string) {
    if (!currentState.application) return
    currentState = {
      ...currentState,
      application: {
        ...currentState.application,
        status: 'rejected',
        rejectionReason,
      },
      technicianProfile: {
        ...currentState.technicianProfile,
        status: 'profile_pending',
      },
    }
    saveState()
  },

  approveForAssessment() {
    if (!currentState.application) return
    currentState = {
      ...currentState,
      application: {
        ...currentState.application,
        status: 'approved_for_assessment',
      },
      technicianProfile: {
        ...currentState.technicianProfile,
        status: 'assessment_assigned',
      },
    }
    saveState()
  },

  assignAssessment(details: Omit<AssessmentDetails, 'scheduledAt'>) {
    if (!currentState.application) return
    const assessment: AssessmentDetails = {
      ...details,
      scheduledAt: new Date().toISOString(),
    }

    currentState = {
      ...currentState,
      application: {
        ...currentState.application,
        status: 'assessment_scheduled',
        assessment,
      },
      technicianProfile: {
        ...currentState.technicianProfile,
        status: 'assessment_assigned',
      },
    }
    saveState()
  },

  recordAssessmentResult(score: number, evaluatorNotes: string, result: 'pass' | 'fail') {
    if (!currentState.application || !currentState.application.assessment) return

    const updatedAssessment: AssessmentDetails = {
      ...currentState.application.assessment,
      score,
      evaluatorNotes,
      result,
      completedAt: new Date().toISOString(),
    }

    const nextStatus: TechnicianApplicationStatus = result === 'pass' ? 'assessment_passed' : 'assessment_failed'

    currentState = {
      ...currentState,
      application: {
        ...currentState.application,
        status: nextStatus,
        assessment: updatedAssessment,
      },
      technicianProfile: {
        ...currentState.technicianProfile,
        status: result === 'pass' ? 'assessment_passed' : 'reassessment',
      },
    }
    saveState()
  },

  scheduleReassessment(details: Omit<AssessmentDetails, 'scheduledAt'>) {
    this.assignAssessment(details)
  },

  finalApproveTechnician() {
    if (!currentState.application) return
    currentState = {
      ...currentState,
      application: {
        ...currentState.application,
        status: 'approved',
      },
      technicianProfile: {
        ...currentState.technicianProfile,
        status: 'approved',
      },
    }
    saveState()
  },

  // Job & Ticket Actions
  assignTicketToTechnician(ticketId: string, technicianId: string, technicianName: string) {
    currentState = {
      ...currentState,
      tickets: currentState.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              assignedTechnicianId: technicianId,
              assignedTechnicianName: technicianName,
              status: 'CREATED',
            }
          : ticket
      ),
    }
    saveState()
  },

  acceptJob(ticketId: string) {
    currentState = {
      ...currentState,
      tickets: currentState.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: 'ACCEPTED' } : ticket
      ),
    }
    saveState()
  },

  startTravelJob(ticketId: string) {
    currentState = {
      ...currentState,
      tickets: currentState.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: 'ON_THE_WAY' } : ticket
      ),
    }
    saveState()
  },

  verifyArrivalOtp(ticketId: string, enteredOtp: string): boolean {
    const ticket = currentState.tickets.find((t) => t.id === ticketId)
    if (!ticket) return false
    if (ticket.otp.trim() === enteredOtp.trim()) {
      currentState = {
        ...currentState,
        tickets: currentState.tickets.map((t) =>
          t.id === ticketId ? { ...t, otpVerified: true, status: 'ARRIVED' } : t
        ),
      }
      saveState()
      return true
    }
    return false
  },

  startRepairJob(ticketId: string) {
    currentState = {
      ...currentState,
      tickets: currentState.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: 'REPAIR_STARTED' } : ticket
      ),
    }
    saveState()
  },

  completeRepairJob(ticketId: string, repairDetails: RepairDetails) {
    currentState = {
      ...currentState,
      tickets: currentState.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: 'COMPLETED',
              repairDetails: {
                ...repairDetails,
                completedAt: new Date().toISOString(),
              },
            }
          : ticket
      ),
    }
    saveState()
  },

  rateTechnician(ticketId: string, rating: number, review?: string) {
    currentState = {
      ...currentState,
      tickets: currentState.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              customerRating: rating,
              customerReview: review,
            }
          : ticket
      ),
    }
    saveState()
  },

  resetStore() {
    localStorage.removeItem(STORAGE_KEY)
    currentState = {
      technicianProfile: initialProfile,
      application: null,
      assessmentCenters: defaultCenters,
      tickets: initialTickets,
      technicianSettings: defaultTechnicianSettings,
    }
    saveState()
  },
}

export function useMockStore(): PortalStoreState {
  return useSyncExternalStore(
    mockStore.subscribe,
    mockStore.getState,
    mockStore.getState
  )
}

