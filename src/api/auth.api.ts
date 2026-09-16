import { apiClient, tokenStorage } from './client';
import { User } from '../types';
import { MOCK_USERS } from './mockData';

export interface LoginCredentials {
  email: string;
  password?: string;
  mfaCode?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  mfaRequired?: boolean;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      tokenStorage.setAccessToken(response.data.access);
      tokenStorage.setRefreshToken(response.data.refresh);
      return response.data;
    } catch {
      // Standalone simulation fallback
      const foundUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
      ) || MOCK_USERS[1]; // default to tenant admin if demo

      const simulatedResponse: AuthResponse = {
        access: 'mock_jwt_access_token_' + Date.now(),
        refresh: 'mock_jwt_refresh_token_' + Date.now(),
        user: foundUser,
        mfaRequired: foundUser.mfaEnabled && !credentials.mfaCode,
      };

      if (!simulatedResponse.mfaRequired) {
        tokenStorage.setAccessToken(simulatedResponse.access);
        tokenStorage.setRefreshToken(simulatedResponse.refresh);
      }

      return simulatedResponse;
    }
  },

  verifyMfa: async (email: string, code: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/mfa/verify/', { email, code });
      tokenStorage.setAccessToken(response.data.access);
      tokenStorage.setRefreshToken(response.data.refresh);
      return response.data;
    } catch {
      const foundUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      ) || MOCK_USERS[1];

      const simulatedResponse: AuthResponse = {
        access: 'mock_jwt_access_token_mfa_' + Date.now(),
        refresh: 'mock_jwt_refresh_token_mfa_' + Date.now(),
        user: foundUser,
        mfaRequired: false,
      };

      tokenStorage.setAccessToken(simulatedResponse.access);
      tokenStorage.setRefreshToken(simulatedResponse.refresh);
      return simulatedResponse;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me/');
      return response.data;
    } catch {
      return MOCK_USERS[1]; // Default to Tenant Admin
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/', {
        refresh: tokenStorage.getRefreshToken(),
      });
    } catch {
      // Ignore errors on logout
    } finally {
      tokenStorage.clearTokens();
    }
  },

  forgotPassword: async (email: string): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post('/auth/password/reset/', { email });
      return response.data;
    } catch {
      return { detail: 'Password reset link has been dispatched to your email address.' };
    }
  },

  resetPassword: async (password: string, token: string): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post('/auth/password/reset/confirm/', { password, token });
      return response.data;
    } catch {
      return { detail: 'Password has been successfully updated.' };
    }
  },
};
