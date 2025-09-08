import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AddFeedModal = ({ isOpen, onClose, onSubmit, editingFeed = null }) => {
  const [formData, setFormData] = useState({
    name: editingFeed?.name || '',
    url: editingFeed?.url || '',
    categories: editingFeed?.categories || [],
    status: editingFeed?.status || 'active',
    description: editingFeed?.description || ''
  });
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const categoryOptions = [
    { value: 'AI_ML', label: 'AI & Machine Learning' },
    { value: 'WEB_DEV', label: 'Web Development' },
    { value: 'MOBILE_DEV', label: 'Mobile Development' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'DEVOPS', label: 'DevOps' },
    { value: 'SECURITY', label: 'Security' },
    { value: 'CLOUD', label: 'Cloud Computing' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'Internet of Things' },
    { value: 'OTHER', label: 'Inne' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Aktywny' },
    { value: 'inactive', label: 'Nieaktywny' }
  ];

  const validateUrl = async (url) => {
    setIsValidating(true);
    setValidationResult(null);
    
    // Simulate URL validation
    setTimeout(() => {
      const isValid = url?.includes('rss') || url?.includes('feed') || url?.includes('xml');
      setValidationResult({
        isValid,
        message: isValid 
          ? 'Źródło RSS zostało pomyślnie zweryfikowane' :'Nie można zweryfikować źródła RSS. Sprawdź URL.',
        responseTime: Math.floor(Math.random() * 500) + 200,
        articlesFound: isValid ? Math.floor(Math.random() * 50) + 10 : 0
      });
      setIsValidating(false);
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'url' && value) {
      setValidationResult(null);
    }
  };

  const handleCategoryChange = (category, checked) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev?.categories, category]
        : prev?.categories?.filter(c => c !== category)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Nazwa jest wymagana';
    }
    
    if (!formData?.url?.trim()) {
      newErrors.url = 'URL jest wymagany';
    } else if (!formData?.url?.match(/^https?:\/\/.+/)) {
      newErrors.url = 'Wprowadź prawidłowy URL';
    }
    
    if (formData?.categories?.length === 0) {
      newErrors.categories = 'Wybierz przynajmniej jedną kategorię';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleValidateUrl = () => {
    if (formData?.url) {
      validateUrl(formData?.url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingFeed ? 'Edytuj źródło RSS' : 'Dodaj nowe źródło RSS'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Podstawowe informacje</h3>
            
            <Input
              label="Nazwa źródła"
              type="text"
              placeholder="np. TechCrunch RSS"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <div className="space-y-2">
              <Input
                label="URL źródła RSS"
                type="url"
                placeholder="https://example.com/rss"
                value={formData?.url}
                onChange={(e) => handleInputChange('url', e?.target?.value)}
                error={errors?.url}
                required
              />
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidateUrl}
                  disabled={!formData?.url || isValidating}
                  loading={isValidating}
                  iconName="CheckCircle"
                  iconPosition="left"
                >
                  Sprawdź źródło
                </Button>
                
                {validationResult && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    validationResult?.isValid ? 'text-success' : 'text-error'
                  }`}>
                    <Icon 
                      name={validationResult?.isValid ? 'CheckCircle' : 'XCircle'} 
                      size={16} 
                    />
                    <span>{validationResult?.message}</span>
                  </div>
                )}
              </div>
              
              {validationResult?.isValid && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-success text-sm">
                    <Icon name="Info" size={16} />
                    <span>Szczegóły weryfikacji:</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>• Czas odpowiedzi: {validationResult?.responseTime}ms</p>
                    <p>• Znalezione artykuły: {validationResult?.articlesFound}</p>
                    <p>• Format: RSS 2.0</p>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Opis (opcjonalny)"
              type="text"
              placeholder="Krótki opis źródła RSS"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
            />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">Kategorie</h3>
              <p className="text-sm text-muted-foreground">Wybierz kategorie, które najlepiej opisują zawartość tego źródła</p>
            </div>
            
            {errors?.categories && (
              <p className="text-sm text-error">{errors?.categories}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {categoryOptions?.map((category) => (
                <Checkbox
                  key={category?.value}
                  label={category?.label}
                  checked={formData?.categories?.includes(category?.value)}
                  onChange={(e) => handleCategoryChange(category?.value, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Status</h3>
            
            <Select
              label="Status początkowy"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
              description="Źródło można aktywować później z listy"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              iconName={editingFeed ? "Save" : "Plus"}
              iconPosition="left"
            >
              {editingFeed ? 'Zapisz zmiany' : 'Dodaj źródło'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeedModal;