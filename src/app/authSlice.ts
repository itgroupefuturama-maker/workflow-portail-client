import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  nom: string;
  idVisaAbstract: string;
  actif: boolean;
  isValidate: boolean;
  createdAt: string;
  clientBeneficiaireForms: any[];
  userDocument: any[];
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiresIn');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;