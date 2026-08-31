import { registeredCustomers, type CustomerProfile } from '../mocks/customerData'
import type { UserRole } from '../types/auth'

const CUSTOMER_ACCOUNT_KEY = 'smartassist_customer_accounts'
const DEFAULT_CUSTOMER_PASSWORD = 'SmartAssist@2026'

export interface AuthResult {
  role: UserRole
  status: 'active' | 'pending_verification'
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase()
}

function getStoredCustomerAccounts(): CustomerProfile[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_ACCOUNT_KEY)
    if (!raw) {
      const seeded = registeredCustomers.map((profile) => ({ ...profile, password: profile.password ?? DEFAULT_CUSTOMER_PASSWORD }))
      localStorage.setItem(CUSTOMER_ACCOUNT_KEY, JSON.stringify(seeded))
      return seeded
    }

    const parsed = JSON.parse(raw) as CustomerProfile[]
    return parsed.length ? parsed : registeredCustomers.map((profile) => ({ ...profile, password: profile.password ?? DEFAULT_CUSTOMER_PASSWORD }))
  } catch {
    return registeredCustomers.map((profile) => ({ ...profile, password: profile.password ?? DEFAULT_CUSTOMER_PASSWORD }))
  }
}

function saveStoredCustomerAccounts(accounts: CustomerProfile[]) {
  localStorage.setItem(CUSTOMER_ACCOUNT_KEY, JSON.stringify(accounts))
}

export function findCustomerAccount(identifier: string): CustomerProfile | undefined {
  const expected = normalizeIdentifier(identifier)
  if (!expected) return undefined

  return getStoredCustomerAccounts().find((account) => {
    const email = normalizeIdentifier(account.email)
    const mobile = normalizeIdentifier(account.mobile.replace(/\D/g, ''))
    return email === expected || mobile === expected.replace(/\D/g, '')
  })
}

export function updateCustomerPassword(identifier: string, password: string): boolean {
  const accounts = getStoredCustomerAccounts()
  const account = findCustomerAccount(identifier)
  if (!account) return false

  const nextAccounts = accounts.map((item) => {
    const sameEmail = normalizeIdentifier(item.email) === normalizeIdentifier(account.email)
    const sameMobile = normalizeIdentifier(item.mobile.replace(/\D/g, '')) === normalizeIdentifier(account.mobile.replace(/\D/g, ''))
    if (sameEmail || sameMobile) {
      return { ...item, password }
    }
    return item
  })

  saveStoredCustomerAccounts(nextAccounts)
  return true
}

export function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function login(role: UserRole, identifier: string, password: string): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 650))

  if (role === 'customer') {
    const account = findCustomerAccount(identifier)
    if (!account) {
      throw new Error('Invalid customer credentials.')
    }

    const storedPassword = account.password ?? DEFAULT_CUSTOMER_PASSWORD
    if (storedPassword !== password) {
      throw new Error('Invalid customer credentials.')
    }
  }

  return { role, status: role === 'electrician' ? 'pending_verification' : 'active' }
}

export async function register(role: Exclude<UserRole, 'admin'>): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 850))
  return { role, status: role === 'electrician' ? 'pending_verification' : 'active' }
}
