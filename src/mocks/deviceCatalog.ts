export type DeviceCategory = 'Security' | 'Lighting' | 'Climate' | 'Entertainment' | 'Networking' | 'Kitchen' | 'Cleaning' | 'Other'

export interface CatalogDevice {
  id: string
  name: string
  category: DeviceCategory
  icon: 'lock' | 'camera' | 'doorbell' | 'sensor' | 'bulb' | 'strip' | 'switch' | 'ac' | 'thermostat' | 'purifier' | 'tv' | 'speaker' | 'soundbar' | 'router' | 'extender' | 'mesh' | 'fridge' | 'microwave' | 'dishwasher' | 'vacuum' | 'washer' | 'dryer' | 'plug' | 'smoke' | 'leak' | 'curtain' | 'garage'
}

export const deviceCategories: DeviceCategory[] = ['Security', 'Lighting', 'Climate', 'Entertainment', 'Networking', 'Kitchen', 'Cleaning', 'Other']

export const deviceCatalog: CatalogDevice[] = [
  { id: 'smart-door-lock', name: 'Smart Door Lock', category: 'Security', icon: 'lock' },
  { id: 'smart-security-camera', name: 'Smart Security Camera', category: 'Security', icon: 'camera' },
  { id: 'smart-video-doorbell', name: 'Smart Video Doorbell', category: 'Security', icon: 'doorbell' },
  { id: 'smart-door-sensor', name: 'Smart Door Sensor', category: 'Security', icon: 'sensor' },
  { id: 'smart-led-bulb', name: 'Smart LED Bulb', category: 'Lighting', icon: 'bulb' },
  { id: 'smart-light-strip', name: 'Smart Light Strip', category: 'Lighting', icon: 'strip' },
  { id: 'smart-switch', name: 'Smart Switch', category: 'Lighting', icon: 'switch' },
  { id: 'smart-air-conditioner', name: 'Smart Air Conditioner', category: 'Climate', icon: 'ac' },
  { id: 'smart-thermostat', name: 'Smart Thermostat', category: 'Climate', icon: 'thermostat' },
  { id: 'smart-air-purifier', name: 'Smart Air Purifier', category: 'Climate', icon: 'purifier' },
  { id: 'smart-tv', name: 'Smart TV', category: 'Entertainment', icon: 'tv' },
  { id: 'smart-speaker', name: 'Smart Speaker', category: 'Entertainment', icon: 'speaker' },
  { id: 'smart-soundbar', name: 'Smart Soundbar', category: 'Entertainment', icon: 'soundbar' },
  { id: 'wi-fi-router', name: 'Wi-Fi Router', category: 'Networking', icon: 'router' },
  { id: 'wi-fi-extender', name: 'Wi-Fi Extender', category: 'Networking', icon: 'extender' },
  { id: 'mesh-wi-fi-system', name: 'Mesh Wi-Fi System', category: 'Networking', icon: 'mesh' },
  { id: 'smart-refrigerator', name: 'Smart Refrigerator', category: 'Kitchen', icon: 'fridge' },
  { id: 'smart-microwave', name: 'Smart Microwave', category: 'Kitchen', icon: 'microwave' },
  { id: 'smart-dishwasher', name: 'Smart Dishwasher', category: 'Kitchen', icon: 'dishwasher' },
  { id: 'robot-vacuum', name: 'Robot Vacuum', category: 'Cleaning', icon: 'vacuum' },
  { id: 'smart-washing-machine', name: 'Smart Washing Machine', category: 'Cleaning', icon: 'washer' },
  { id: 'smart-dryer', name: 'Smart Dryer', category: 'Cleaning', icon: 'dryer' },
  { id: 'smart-plug', name: 'Smart Plug', category: 'Other', icon: 'plug' },
  { id: 'smart-smoke-detector', name: 'Smart Smoke Detector', category: 'Other', icon: 'smoke' },
  { id: 'smart-water-leak-sensor', name: 'Smart Water Leak Sensor', category: 'Other', icon: 'leak' },
  { id: 'smart-curtain-motor', name: 'Smart Curtain Motor', category: 'Other', icon: 'curtain' },
  { id: 'smart-garage-door-opener', name: 'Smart Garage Door Opener', category: 'Other', icon: 'garage' },
]
