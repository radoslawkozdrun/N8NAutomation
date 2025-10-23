import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, isLoading, error, initialData }) => {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    password: initialData?.password || '',
    rememberMe: initialData?.rememberMe || false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Update form data when initialData changes (e.g., when demo credentials are used)
  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData?.email || '',
        password: initialData?.password || '',
        rememberMe: initialData?.rememberMe || false
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email) {
      errors.email = 'Username is required';
    }
    
    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            name="email"
            placeholder="Enter username"
            value={formData?.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {validationErrors?.email && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={formData?.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
            </button>
          </div>
          {validationErrors?.password && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
          Remember me
        </label>
      </div>
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <p className="skote-body-text text-error">{error}</p>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>

      {/* Social Login */}
      <div className="mt-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Sign in with</p>
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8H21V16H9z" />
                <path d="M5 8V16H3V8z" />
                <path d="M13 12L17 16H9z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </button>
            <button
              type="button"
              className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="text-center mt-6">
        <a href="/forgot-password" className="text-gray-500 hover:text-blue-600 text-sm transition-colors inline-flex items-center">
          <Icon name="Lock" size={16} className="mr-1" />
          Forgot your password?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;