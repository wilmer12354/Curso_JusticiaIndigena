const CACHE_KEY = "auth_cache";
const TRIAL_KEY = "trial_session";
const PW_KEY = "pw_session";

export type AuthCache = {
  email: string;
  role: string;
  name: string;
  status?: string;
};

export type TrialSession = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "prueba";
};

export type PasswordSession = {
  id: string;
  username: string;
  name: string;
  role: string;
  status: string;
  mustChangePassword?: boolean;
};

export function setAuthCache(data: AuthCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

export function getAuthCache(): AuthCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthCache;
  } catch {
    return null;
  }
}

export function clearAuthCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

export function setTrialSession(data: TrialSession): void {
  try {
    localStorage.setItem(TRIAL_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

export function getTrialSession(): TrialSession | null {
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TrialSession;
  } catch {
    return null;
  }
}

export function clearTrialSession(): void {
  try {
    localStorage.removeItem(TRIAL_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

export function setPasswordSession(data: PasswordSession): void {
  try {
    localStorage.setItem(PW_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

export function getPasswordSession(): PasswordSession | null {
  try {
    const raw = localStorage.getItem(PW_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PasswordSession;
  } catch {
    return null;
  }
}

export function clearPasswordSession(): void {
  try {
    localStorage.removeItem(PW_KEY);
  } catch {
    // localStorage may be unavailable
  }
}