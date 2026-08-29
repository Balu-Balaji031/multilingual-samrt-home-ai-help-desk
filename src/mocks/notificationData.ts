export type NotificationType = 'service' | 'ai' | 'account'

export interface CustomerNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
}

export const customerNotifications: CustomerNotification[] = [
  { id: 'notification-1', type: 'service', title: 'Technician Assigned', description: 'Mark Kumar accepted your service request.', timestamp: '10 minutes ago', read: false },
  { id: 'notification-2', type: 'service', title: 'Technician On the Way', description: 'Your technician is travelling to your location.', timestamp: '25 minutes ago', read: false },
  { id: 'notification-3', type: 'ai', title: 'AI Troubleshooting Completed', description: 'Your camera session is ready to review.', timestamp: 'Yesterday', read: true },
  { id: 'notification-4', type: 'account', title: 'Profile Updated', description: 'Your SmartAssist profile details were updated.', timestamp: 'Aug 26, 2026', read: true },
]
