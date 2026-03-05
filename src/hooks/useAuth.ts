import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { login, logout } from '../app/authSlice';
import type { User } from '../app/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);

  // On utilise l'interface User de l'authSlice
  const handleLogin = (tokenData: { token: string }) => {
    dispatch(login(tokenData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return { isAuthenticated, token, user, login: handleLogin, logout: handleLogout };
}