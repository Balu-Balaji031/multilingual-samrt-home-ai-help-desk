export interface CustomerProfile {
  name: string
  email: string
  mobile: string
  address1: string
  address2: string
  city: string
  state: string
  pincode: string
  landmark: string
  language: 'en' | 'ta' | 'te'
  profilePhoto?: string
  location: string
}

export const mockCustomerProfile: CustomerProfile = {
  name: 'Rx 100',
  email: 'customer@example.com',
  mobile: '+91 98765 43210',
  address1: '24 Lake View Road',
  address2: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600028',
  landmark: 'Near Adyar Park',
  language: 'en',
  location: 'Chennai, Tamil Nadu',
}

export const devices = [
  { id: 'camera', name: 'Security Camera', brand: 'Xiaomi', model: 'C300', location: 'Entrance', status: 'Registered', warranty: 'Active', icon: 'camera' },
  { id: 'light', name: 'Smart Light', brand: 'Philips', model: 'Hue White', location: 'Bedroom', status: 'Registered', warranty: 'Active', icon: 'light' },
  { id: 'ac', name: 'Smart AC', brand: 'LG', model: 'DualCool', location: 'Living Room', status: 'Registered', warranty: 'Expired', icon: 'ac' },
]

export const activeTicket = { id: 'TKT-04556292', device: 'Smart Security Camera', issue: 'Camera is not working', status: 'On the Way', technician: 'Mark Kumar', eta: '25 minutes', rating: '4.8' }

export const recentActivity = [
  { icon: 'check', title: 'Camera repair completed', date: 'Today' },
  { icon: 'sparkles', title: 'AI troubleshooting completed', date: 'Yesterday' },
  { icon: 'ticket', title: 'Service ticket created', date: 'Aug 25' },
  { icon: 'device', title: 'Smart AC added', date: 'Aug 22' },
]

export const completedTickets = [
  { id: 'TKT-04511231', device: 'Smart AC', issue: 'Not Cooling', technician: 'Arun Kumar', date: 'Aug 20, 2026', status: 'Completed' },
  { id: 'TKT-04508742', device: 'Smart Light', issue: 'Light not responding', technician: 'Priya Shah', date: 'Aug 12, 2026', status: 'Completed' },
]
