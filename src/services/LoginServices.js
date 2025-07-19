// src/services/LoginServices.js
import apiClient from './api';

const login = async (email, password) => {
  try {
    const response = await apiClient.post('/V1/login', {
      email,
      password,
    });
    
    // Si la respuesta tiene un token y un usuario
    if (response.data.token && response.data.user) {
      
      // =================================================================
      // ¡AQUÍ ESTÁ LA SOLUCIÓN!
      // La API nos da el email como un string. Lo guardamos.
      const userEmail = response.data.user;

      // Creamos el objeto 'user' que nuestra aplicación espera.
      // Para el nombre, como no lo recibimos, podemos extraerlo del email.
      const userObject = {
        email: userEmail,
        name: userEmail.split('@')[0] // Esto tomará la parte antes del '@' (ej. "abner95")
      };

      // Ahora guardamos el TOKEN y el OBJETO de usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userObject));
      // =================================================================
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