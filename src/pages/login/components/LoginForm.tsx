import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email) {
      errors.email = 'Adres email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      errors.email = 'Wprowadź prawidłowy adres email';
    }
    
    if (!formData?.password) {
      errors.password = 'Hasło jest wymagane';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Hasło musi mieć co najmniej 6 znaków';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Adres email"
          type="email"
          name="email"
          placeholder="wprowadź@email.com"
          value={formData?.email}
          onChange={handleInputChange}
          error={validationErrors?.email}
          required
          disabled={isLoading}
          className="w-full"
        />

        <div className="relative">
          <Input
            label="Hasło"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Wprowadź hasło"
            value={formData?.password}
            onChange={handleInputChange}
            error={validationErrors?.password}
            required
            disabled={isLoading}
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-hover"
            disabled={isLoading}
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Checkbox
          label="Zapamiętaj mnie"
          name="rememberMe"
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-hover"
        >
          Zapomniałeś hasła?
        </a>
      </div>
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <p className="text-sm text-error">{error}</p>
          </div>
        </div>
      )}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
      </Button>
    </form>
  );
};

export default LoginForm;