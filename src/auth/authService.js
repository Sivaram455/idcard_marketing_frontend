import { apiLogin } from '../utils/api';

export const loginUser = async (email, password) => {
  try {
    const result = await apiLogin(email, password);
    if (result.success) {
      const { token, user } = result.data;

      // Map backend role → frontend role
      let role = user.role;
      if (user.role === 'GMMC_ADMIN') role = 'admin';
      else if (user.role === 'SCHOOL_ADMIN') role = 'school';
      else if (user.role === 'PRINTER') role = 'printer';
      else if (user.role === 'AGENT') role = 'agent';
      else if (user.role === 'MARKETER') role = 'marketer';
      // SUPPORT and DEVELOPER can stay as is (uppercase) or mapped. 
      // Login.jsx check used uppercase.

      // Store the token AND the mapped user (with frontend role)
      const mappedUser = { ...user, role };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mappedUser));

      return { success: true, role, user: mappedUser };
    }
    return { success: false };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const isAuthenticated = () => !!localStorage.getItem('token');
export const getUser = () => JSON.parse(localStorage.getItem('user'));
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};