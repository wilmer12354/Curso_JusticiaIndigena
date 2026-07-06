const CACHE_KEY = "auth_cache";

export type AuthCache = {
  email: string;
  role: string;
  name: string;
  status?: string;
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
