interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  rating: number;
  reviews_count: number;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

const AUTH_URL = 'https://functions.poehali.dev/bb4abf3d-6f0e-4aa2-b4cc-7d715ba66359';

export const auth = {
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth(token: string, user: User) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_URL}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }

    this.setAuth(data.token, data.user);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }

    this.setAuth(data.token, data.user);
    return data;
  },

  logout() {
    this.clearAuth();
  }
};
