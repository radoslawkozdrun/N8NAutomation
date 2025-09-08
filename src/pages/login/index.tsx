import React, { useState, useEffect } from 'react';
import { useMockNavigate } from '../../utils/mockNavigation';
import LoginForm from './components/LoginForm';
import LoginHeader from './components/LoginHeader';
import DemoCredentials from './components/DemoCredentials';
import LoginFooter from './components/LoginFooter';

const Login = () => {
  const navigate = useMockNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Mock user data for authentication
  const mockUsers = [
    {
      id: 1,
      email: 'admin@opix.pl',
      password: 'admin123',
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
      name: 'Nieaktywny Użytkownik',
      isActive: false,
      lastLogin: null
    }
  ];

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user?.isActive) {
          navigate('/dashboard');
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, [navigate]);

  const handleLogin = async (loginData) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find user by email and password
      const user = mockUsers?.find(
        u => u?.email === loginData?.email && u?.password === loginData?.password
      );

      if (!user) {
        throw new Error('Nieprawidłowy adres email lub hasło');
      }

      if (!user?.isActive) {
        throw new Error('Konto zostało dezaktywowane. Skontaktuj się z administratorem.');
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

      // Track login activity (mock)
      const loginActivity = {
        userId: user?.id,
        timestamp: new Date()?.toISOString(),
        ipAddress: '192.168.1.1', // Mock IP
        userAgent: navigator.userAgent,
        success: true
      };
      
      const existingActivity = JSON.parse(localStorage.getItem('loginActivity') || '[]');
      existingActivity?.push(loginActivity);
      localStorage.setItem('loginActivity', JSON.stringify(existingActivity?.slice(-50))); // Keep last 50 entries

      // Navigate to dashboard
      navigate('/dashboard');

    } catch (err) {
      setError(err?.message);
      
      // Track failed login attempt
      const failedActivity = {
        email: loginData?.email,
        timestamp: new Date()?.toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent,
        success: false,
        error: err?.message
      };
      
      const existingActivity = JSON.parse(localStorage.getItem('loginActivity') || '[]');
      existingActivity?.push(failedActivity);
      localStorage.setItem('loginActivity', JSON.stringify(existingActivity?.slice(-50)));
      
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-modal border border-border p-8">
          <LoginHeader />
          
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
            initialData={formData}
          />
          
          <DemoCredentials onUseCredentials={handleUseCredentials} />
          
          <LoginFooter />
        </div>
        
        {/* Additional Info Card */}
        <div className="mt-6 bg-card/50 rounded-lg border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Potrzebujesz pomocy? Skontaktuj się z{' '}
            <a
              href="mailto:support@opix.pl"
              className="text-primary hover:text-primary/80 transition-hover"
            >
              support@opix.pl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;