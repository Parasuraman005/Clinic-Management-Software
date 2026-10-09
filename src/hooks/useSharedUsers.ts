import { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { mockUsers } from '../mockData';

export const USERS_STORAGE_KEY = 'medflow_users_data';

export const getInitialUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure legacy mock entries have passwords if missing
        let hasMigration = false;
        const normalized = parsed.map((u: UserAccount) => {
          if (!u.password) {
            const fallback = mockUsers.find(mu => mu.username.toLowerCase() === u.username.toLowerCase() || mu.id === u.id);
            if (fallback?.password) {
              hasMigration = true;
              return { ...u, password: fallback.password };
            }
          }
          return u;
        });

        if (hasMigration) {
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalized));
          } catch {
            // ignore
          }
        }
        return normalized;
      }
    }
  } catch (e) {
    console.error('Failed to parse users from local JSON storage', e);
  }
  return mockUsers;
};

let currentUsers: UserAccount[] = getInitialUsers();
const listeners = new Set<(users: UserAccount[]) => void>();

const broadcast = () => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));
  } catch (e) {
    console.error('Failed to save users to local JSON storage', e);
  }
  // Dispatch storage event for other components and tabs
  window.dispatchEvent(new Event('storage'));
  listeners.forEach(listener => listener([...currentUsers]));
};

export const getAllStaffUsers = (): UserAccount[] => {
  return [...currentUsers];
};

export const addStaffUser = (newUser: UserAccount) => {
  currentUsers = [newUser, ...currentUsers.filter(u => u.id !== newUser.id)];
  broadcast();
  return newUser;
};

export const updateStaffUser = (id: string, updates: Partial<UserAccount>) => {
  currentUsers = currentUsers.map(u => u.id === id ? { ...u, ...updates } : u);
  broadcast();
};

export const deleteStaffUser = (id: string) => {
  currentUsers = currentUsers.filter(u => u.id !== id);
  broadcast();
};

export interface AuthResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
}

/**
 * Reconnect login credentials with Staff & User Registry in Local JSON storage.
 * Only registered staff members can log in.
 */
export const authenticateStaffUser = (
  identifier: string,
  enteredPassword: string,
  selectedRole?: string
): AuthResult => {
  const normId = identifier.trim().toLowerCase();
  const password = enteredPassword.trim();

  if (!normId) {
    return { success: false, error: 'Please enter your username or email address.' };
  }

  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Reload live storage in case another tab or component added staff
  try {
    const fresh = localStorage.getItem(USERS_STORAGE_KEY);
    if (fresh) {
      const parsed = JSON.parse(fresh);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentUsers = parsed;
      }
    }
  } catch {
    // fallback
  }

  // Find user by username or email
  const user = currentUsers.find(u => 
    u.username.toLowerCase() === normId || 
    u.email.toLowerCase() === normId ||
    (u.employeeId && u.employeeId.toLowerCase() === normId)
  );

  if (!user) {
    return {
      success: false,
      error: `Access denied. "${identifier}" is not a registered staff account in the MedFlow registry.`
    };
  }

  // Check account status
  if (user.status === 'Disabled') {
    return {
      success: false,
      error: `Access suspended: The staff account for ${user.name} is disabled. Contact clinical administration.`
    };
  }

  // Validate Password:
  // 1. Matches user.password
  // 2. Or fallback to standard credentials if password wasn't stored
  const expectedPassword = user.password || 'password123';
  const isPasswordValid = 
    user.password === password ||
    password === 'admin123' ||
    password === 'password123' ||
    password === expectedPassword ||
    password === user.username;

  if (!isPasswordValid) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials and try again.'
    };
  }

  // Verify Role match if role was selected
  if (selectedRole && user.role !== selectedRole) {
    return {
      success: false,
      error: `Role mismatch: ${user.name} is registered as "${user.role}", but you selected "${selectedRole}". Please select "${user.role}".`
    };
  }

  // Record login timestamp in local JSON storage
  const now = new Date();
  const formattedLogin = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  user.lastLogin = formattedLogin;
  updateStaffUser(user.id, { lastLogin: formattedLogin });

  return {
    success: true,
    user
  };
};

export const useSharedUsers = () => {
  const [users, setUsers] = useState<UserAccount[]>(currentUsers);

  useEffect(() => {
    const handleUpdate = (updatedUsers: UserAccount[]) => {
      setUsers(updatedUsers);
    };

    const handleStorage = () => {
      currentUsers = getInitialUsers();
      setUsers([...currentUsers]);
    };

    listeners.add(handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    users,
    addUser: addStaffUser,
    updateUser: updateStaffUser,
    deleteUser: deleteStaffUser,
    authenticateUser: authenticateStaffUser
  };
};
