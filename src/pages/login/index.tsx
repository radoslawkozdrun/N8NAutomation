import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import LoginForm from './components/LoginForm';
import LoginHeader from './components/LoginHeader';
import DemoCredentials from './components/DemoCredentials';
import LoginFooter from './components/LoginFooter';

const Login = () => {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Mock user data for authentication (fallback when API fails)
  const mockUsers = [
    {
      id: 1,
      email: 'admin',
      password: '1qaz@WSX',
      role: 'ADMIN',
      name: 'Administrator Systemu',
      isActive: true,
      lastLogin: new Date()?.toISOString()
    },
    {
      id: 2,
      email: 'user@opix.pl',
      password: 'user123',
      role: 'USER',
      name: 'Jan Kowalski',
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000)?.toISOString()
    },
    {
      id: 3,
      email: 'demo@opix.pl',
      password: 'demo123',
      role: 'DEMO',
      name: 'Konto Demo',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000)?.toISOString()
    },
    {
      id: 4,
      email: 'inactive@opix.pl',
      password: 'inactive123',
      role: 'USER',
      name: 'Inactive User',
      isActive: false,
      lastLogin: null
    }
  ];

  // No need for this useEffect - AuthContext handles redirect

  const handleLogin = async (loginData) => {
    setIsLoading(true);
    setError('');

    try {
      // Try real API first
      const response = await api.login({
        email: loginData.email,
        password: loginData.password
      });

      if (response.success && response.data) {
        // Store authentication data from API response
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));

        if (loginData?.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Refresh user in AuthContext - this will trigger redirect to dashboard
        await refreshUser();
        return;
      }
    } catch (apiError) {
      console.log('API login failed, trying mock login:', apiError);
      
      try {
        // Fallback to mock authentication if API fails
        // Find user by email and password
        const user = mockUsers?.find(
          u => u?.email === loginData?.email && u?.password === loginData?.password
        );

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user?.isActive) {
          throw new Error('Account has been deactivated. Contact the administrator.');
        }

        // Generate mock JWT token
        const token = `mock-jwt-token-${user?.id}-${Date.now()}`;
        
        // Update user's last login
        const updatedUser = {
          ...user,
          lastLogin: new Date()?.toISOString()
        };

        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(updatedUser));

        if (loginData?.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Refresh user in AuthContext - this will trigger redirect to dashboard
        await refreshUser();
      } catch (err) {
        setError(err?.message || 'Login error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCredentials = (email, password) => {
    setFormData(prev => ({
      ...prev,
      email,
      password
    }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <LoginHeader />

          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
            initialData={formData}
          />

          {/* Demo Credentials - For easy testing */}
          <DemoCredentials onUseCredentials={handleUseCredentials} />

          <LoginFooter />
        </div>
      </div>
    </div>
  );
};

export default Login;