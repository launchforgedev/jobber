/**
 * Authentication & Storage Service
 * Strictly implements Section 1:
 * - Minimal, secure client & local storage session handling
 * - Users read and modify only their own kits (scoped by userId)
 * - Sensible session expiration handling
 */

import { PrepKit, UserSession } from '../types/prepkit.ts';

const SESSION_KEY = 'jobber_active_session';
const LEGACY_SESSION_KEY = 'trao_active_session';
const USERS_KEY = 'jobber_registered_users';
const LEGACY_USERS_KEY = 'trao_registered_users';
const KITS_KEY_PREFIX = 'jobber_kits_';
const LEGACY_KITS_KEY_PREFIX = 'trao_kits_';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

// Simple hash for password demo storage
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

export function getActiveSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;

    // Check expiration (24 hours)
    const createdTime = new Date(session.createdAt).getTime();
    if (Date.now() - createdTime > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function registerUser(email: string, password: string, name = 'Engineer'): { success: boolean; session?: UserSession; error?: string } {
  if (!email || !password) return { success: false, error: 'Email and password are required' };
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

  try {
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser: UserAccount = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const session: UserSession = {
      userId: newUser.id,
      email: newUser.email,
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Registration failed' };
  }
}

export function loginUser(email: string, password: string): { success: boolean; session?: UserSession; error?: string } {
  if (!email || !password) return { success: false, error: 'Email and password are required' };

  try {
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Invalid email or password' };
    }

    const session: UserSession = {
      userId: user.id,
      email: user.email,
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Login failed' };
  }
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}

/**
 * Isolated User Kit Storage: Users read and modify only their own kits
 */
export function getUserKits(userId: string): Array<{ id: string; kit: PrepKit; savedAt: string }> {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(`${KITS_KEY_PREFIX}${userId}`) || localStorage.getItem(`${LEGACY_KITS_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserKit(userId: string, kitId: string, kit: PrepKit): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const existing = getUserKits(userId);
    const index = existing.findIndex(item => item.id === kitId);
    const entry = { id: kitId, kit, savedAt: new Date().toISOString() };

    if (index >= 0) {
      existing[index] = entry;
    } else {
      existing.unshift(entry);
    }

    localStorage.setItem(`${KITS_KEY_PREFIX}${userId}`, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save kit:', err);
  }
}

export function deleteUserKit(userId: string, kitId: string): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const existing = getUserKits(userId);
    const filtered = existing.filter(item => item.id !== kitId);
    localStorage.setItem(`${KITS_KEY_PREFIX}${userId}`, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete kit:', err);
  }
}
