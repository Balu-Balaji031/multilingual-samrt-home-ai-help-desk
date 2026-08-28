import type { UserRole } from '../types/auth'

export interface AuthResult {
  role: UserRole
  status: 'active' | 'pending_verification'
}

export async function login(role: UserRole, _identifier: string, _password: string): Promise<AuthResult> {
  void _identifier
  void _password
  await new Promise((resolve) => setTimeout(resolve, 650))
  return { role, status: role === 'electrician' ? 'pending_verification' : 'active' }
}

export async function register(role: Exclude<UserRole, 'admin'>): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 850))
  return { role, status: role === 'electrician' ? 'pending_verification' : 'active' }
}
