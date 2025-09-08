import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const SchedulingModal = ({
  isOpen,
  onClose,
  onSchedule,
  selectedPlatforms,
  suggestedTimes
}) => {
  const [schedulingType, setSchedulingType] = useState('immediate');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [recurringSettings, setRecurringSettings] = useState({
    enabled: false,
    frequency: 'daily',
    interval: 1,
    endDate: ''
  });

  const schedulingOptions = [
    {
      id: 'immediate',
      label: 'Opublikuj teraz',
      description: 'Natychmiastowa publikacja na wszystkich platformach',
      icon: 'Zap'
    },
    {
      id: 'scheduled',
      label: 'Zaplanuj publikację',
      description: 'Wybierz konkretną datę i godzinę',
      icon: 'Calendar'
    },
    {
      id: 'optimal',
      label: 'Optymalny czas',
      description: 'AI wybierze najlepszy czas na podstawie analizy',
      icon: 'Brain'
    },
    {
      id: 'recurring',
      label: 'Publikacja cykliczna',
      description: 'Publikuj automatycznie w regularnych odstępach',
      icon: 'Repeat'
    }
  ];

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: 'Twitter',
      linkedin: 'Linkedin', 
      instagram: 'Instagram',
      blog: 'FileText'
    };
    return icons[platform] || 'Globe';
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
  };

  const handleSchedule = () => {
    const scheduleData = {
      type: schedulingType,
      platforms: selectedPlatforms,
      ...(schedulingType === 'scheduled' && { scheduledTime: selectedDateTime }),
      ...(schedulingType === 'optimal' && { timeSlot: selectedTimeSlot }),
      ...(schedulingType === 'recurring' && { recurring: recurringSettings })
    };
    
    onSchedule?.(scheduleData);
    onClose?.();
  };

  const isScheduleValid = () => {
    switch (schedulingType) {
      case 'immediate':
        return true;
      case 'scheduled':
        return selectedDateTime !== '';
      case 'optimal':
        return selectedTimeSlot !== null;
      case 'recurring':
        return recurringSettings.enabled && recurringSettings.endDate !== '';
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Planowanie publikacji
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Wybierz kiedy i jak często publikować post
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Selected Platforms */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Wybrane platformy ({selectedPlatforms?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedPlatforms?.map((platform) => (
                <div
                  key={platform}
                  className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg"
                >
                  <Icon name={getPlatformIcon(platform)} size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {platform}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduling Options */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Opcje planowania
            </h3>
            <div className="space-y-3">
              {schedulingOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all",
                    schedulingType === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/20"
                  )}
                  onClick={() => setSchedulingType(option.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      schedulingType === option.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon name={option.icon} size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground">
                          {option.label}
                        </h4>
                        {schedulingType === option.id && (
                          <Icon name="Check" size={16} className="text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Settings */}
          {schedulingType === 'scheduled' && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Data i godzina publikacji
              </h3>
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={cn(
                  "w-full px-3 py-2 border border-input rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "bg-background text-foreground"
                )}
              />
            </div>
          )}

          {schedulingType === 'optimal' && suggestedTimes && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Sugerowane czasy publikacji
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(suggestedTimes).map(([platform, times]) => (
                  <div key={platform} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon name={getPlatformIcon(platform)} size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {platform}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {times?.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTimeSlot({ platform, time })}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm border rounded transition-colors",
                            selectedTimeSlot?.platform === platform && selectedTimeSlot?.time === time
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50 text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{formatTime(time.time)}</span>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{time.engagement}% engagement</span>
                              <span>•</span>
                              <span>{time.reach} reach</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schedulingType === 'recurring' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Ustawienia publikacji cyklicznej
              </h3>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="recurring-enabled"
                  checked={recurringSettings.enabled}
                  onChange={(e) => setRecurringSettings(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                />
                <label htmlFor="recurring-enabled" className="text-sm text-foreground">
                  Włącz publikację cykliczną
                </label>
              </div>

              {recurringSettings.enabled && (
                <div className="space-y-4 pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        Częstotliwość
                      </label>
                      <select
                        value={recurringSettings.frequency}
                        onChange={(e) => setRecurringSettings(prev => ({
                          ...prev,
                          frequency: e.target.value
                        }))}
                        className={cn(
                          "w-full px-3 py-2 border border-input rounded-lg",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                          "bg-background text-foreground"
                        )}
                      >
                        <option value="daily">Codziennie</option>
                        <option value="weekly">Co tydzień</option>
                        <option value="monthly">Co miesiąc</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        Interwał
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={recurringSettings.interval}
                        onChange={(e) => setRecurringSettings(prev => ({
                          ...prev,
                          interval: parseInt(e.target.value) || 1
                        }))}
                        className={cn(
                          "w-full px-3 py-2 border border-input rounded-lg",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                          "bg-background text-foreground"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Data końcowa
                    </label>
                    <input
                      type="date"
                      value={recurringSettings.endDate}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                      className={cn(
                        "w-full px-3 py-2 border border-input rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                        "bg-background text-foreground"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="text-sm text-muted-foreground">
            {schedulingType === 'immediate' && 'Post zostanie opublikowany natychmiast'}
            {schedulingType === 'scheduled' && selectedDateTime && 
              `Publikacja: ${new Date(selectedDateTime).toLocaleString('pl-PL')}`
            }
            {schedulingType === 'optimal' && selectedTimeSlot && 
              `Optymalny czas dla ${selectedTimeSlot.platform}`
            }
            {schedulingType === 'recurring' && recurringSettings.enabled && 
              `Publikacja co ${recurringSettings.interval} ${recurringSettings.frequency === 'daily' ? 'dzień' : recurringSettings.frequency === 'weekly' ? 'tydzień' : 'miesiąc'}`
            }
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Anuluj
            </Button>
            <Button
              variant="default"
              onClick={handleSchedule}
              disabled={!isScheduleValid()}
              iconName="Calendar"
            >
              Zaplanuj publikację
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingModal;