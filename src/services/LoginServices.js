
import apiClient from './api';

const login = async (email, password) => {
  try {
    const response = await apiClient.post('/V1/login', {
      email,
      password,
    });
    
   
    if (response.data.token && response.data.user) {
      
      
     
      const userEmail = response.data.user;

      
      const userObject = {
        email: userEmail,
        name: userEmail.split('@')[0] 
      };

     
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userObject));
      
    }
    
    return response.data;
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.response?.data || error.message);
    throw error.response?.data || new Error('Error en el inicio de sesión');
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const LoginService = {
  login,
  logout,
};

export default LoginService;