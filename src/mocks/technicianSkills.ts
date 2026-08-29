export const specializationSkills: Record<string, string[]> = {
  'Electrical Installation': ['Electrical Wiring', 'Switch Installation', 'Socket Installation', 'Electrical Fault Diagnosis', 'Lighting Installation'],
  'Home Wiring': ['Home Wiring', 'Switchboard Installation', 'Socket Installation', 'Circuit Troubleshooting', 'Electrical Safety'],
  'Smart Home Installation': ['Smart Lighting', 'Smart Sensors', 'Smart Security', 'Smart Locks', 'Smart Home Automation', 'Smart Device Setup'],
  'CCTV & Security': ['Security Camera Installation', 'Camera Configuration', 'DVR / NVR Setup', 'Video Doorbell Installation', 'Security Sensor Setup'],
  'AC / HVAC': ['AC Installation', 'AC Service', 'AC Troubleshooting', 'Thermostat Installation', 'Air Purifier Setup'],
  'Appliance Repair': ['Smart Refrigerator', 'Smart Microwave', 'Smart Dishwasher', 'Smart Washing Machine', 'Smart Dryer'],
  Networking: ['Router Setup', 'Wi-Fi Configuration', 'Mesh Network', 'Network Troubleshooting'],
}

export const specializationDescriptions: Record<string, string> = {
  'Electrical Installation': 'Electrical installation and basic electrical systems.',
  'Home Wiring': 'Home wiring, switches, sockets and electrical fault work.',
  'Smart Home Installation': 'Smart devices, automation and connected home systems.',
  'CCTV & Security': 'Security cameras, video doorbells and security systems.',
  'AC / HVAC': 'Air conditioners, thermostats and HVAC systems.',
  'Appliance Repair': 'Smart and connected household appliances.',
  Networking: 'Routers, Wi-Fi, extenders and mesh networking.',
}

export const technicianSpecializations = Object.keys(specializationSkills)
export const technicianLanguages = ['English', 'Tamil', 'Telugu', 'Hindi']
export const technicianWorkingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const technicianRadiusOptions = [5, 10, 15, 20, 25, 30, 50]