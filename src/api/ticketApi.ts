export interface MockTicketInput {
  deviceName: string
  brand: string
  location: string
  issue: string
  language: string
  conversation: string[]
}

export interface MockTicket {
  id: string
  status: 'created'
  createdAt: string
  deviceName: string
  issue: string
}

export async function createServiceTicket(input: MockTicketInput): Promise<MockTicket> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return { id: `TKT-${Date.now().toString().slice(-8)}`, status: 'created', createdAt: new Date().toISOString(), deviceName: input.deviceName, issue: input.issue }
}
