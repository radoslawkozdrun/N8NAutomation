import React, { useState, useRef } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const PostCompositionPanel = ({
  selectedArticle,
  selectedPlatforms,
  postContent,
  onContentChange,
  onImageUpload,
  onHashtagAdd,
  onPreview,
  onSave,
  onPublish
}) => {
  const [activeTab, setActiveTab] = useState('compose');
  const fileInputRef = useRef(null);
  
  const platformLimits = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
    blog: null
  };

  const getCharacterCount = (platform) => {
    const content = postContent?.[platform] || '';
    return content.length;
  };

  const getCharacterLimitColor = (platform) => {
    const count = getCharacterCount(platform);
    const limit = platformLimits[platform];
    
    if (!limit) return 'text-muted-foreground';
    
    const ratio = count / limit;
    if (ratio > 0.9) return 'text-error';
    if (ratio > 0.7) return 'text-warning';
    return 'text-muted-foreground';
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    onImageUpload?.(files);
  };

  const insertHashtag = (hashtag) => {
    const currentPlatform = selectedPlatforms?.[0]; // Default to first selected platform
    if (!currentPlatform) return;
    
    const currentContent = postContent?.[currentPlatform] || '';
    const newContent = currentContent + (currentContent ? ' ' : '') + `#${hashtag}`;
    
    onContentChange?.(currentPlatform, newContent);
  };

  const suggestedHashtags = selectedArticle?.suggestedHashtags || [
    'content', 'marketing', 'socialmedia', 'business', 'tech'
  ];

  const tabs = [
    { id: 'compose', label: 'Kompozycja', icon: 'Edit' },
    { id: 'preview', label: 'Podgląd', icon: 'Eye' },
    { id: 'media', label: 'Media', icon: 'Image' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Kompozycja posta
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Stwórz unikalny post na podstawie wybranego artykułu
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Wand2"
              onClick={() => onPreview?.()}
            >
              AI Generator
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              onClick={() => setActiveTab('preview')}
            >
              Podgląd
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'compose' && (
          <div className="space-y-6">
            {/* Article Context */}
            {selectedArticle && (
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    <Icon name="FileText" size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Źródłowy artykuł
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {selectedArticle.title}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{selectedArticle.domain}</span>
                      <span>{selectedArticle.readTime} min czytania</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platform-specific composition */}
            <div className="space-y-4">
              {selectedPlatforms?.map((platform) => (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground capitalize">
                      {platform}
                    </label>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={cn(
                        "font-medium",
                        getCharacterLimitColor(platform)
                      )}>
                        {getCharacterCount(platform)}
                        {platformLimits[platform] && `/${platformLimits[platform]}`}
                      </span>
                      {platformLimits[platform] && (
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              getCharacterCount(platform) > platformLimits[platform] * 0.9
                                ? "bg-error"
                                : getCharacterCount(platform) > platformLimits[platform] * 0.7
                                ? "bg-warning"
                                : "bg-success"
                            )}
                            style={{
                              width: `${Math.min((getCharacterCount(platform) / platformLimits[platform]) * 100, 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <textarea
                    value={postContent?.[platform] || ''}
                    onChange={(e) => onContentChange?.(platform, e.target.value)}
                    placeholder={`Napisz post dla ${platform}...`}
                    rows={platform === 'blog' ? 12 : 6}
                    className={cn(
                      "w-full px-3 py-2 text-sm border border-input rounded-lg resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                      "placeholder:text-muted-foreground bg-background",
                      getCharacterCount(platform) > (platformLimits[platform] || Infinity)
                        ? "border-error"
                        : ""
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Hashtags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                  Sugerowane hashtagi
                </h4>
                <Button
                  variant="ghost"
                  size="xs"
                  iconName="RefreshCw"
                >
                  Odśwież
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((hashtag, index) => (
                  <button
                    key={index}
                    onClick={() => insertHashtag(hashtag)}
                    className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    #{hashtag}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Media
              </h4>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Przeciągnij i upuść pliki lub kliknij, aby wybrać
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Wybierz pliki
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            {selectedPlatforms?.map((platform) => (
              <div key={platform} className="space-y-3">
                <h4 className="text-sm font-medium text-foreground capitalize">
                  Podgląd {platform}
                </h4>
                
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="whitespace-pre-wrap text-sm text-foreground">
                    {postContent?.[platform] || (
                      <span className="text-muted-foreground italic">
                        Brak treści do podglądu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="text-center py-12">
              <Icon name="Image" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                Zarządzanie mediami
              </h4>
              <p className="text-muted-foreground mb-6">
                Dodaj obrazy i wideo do swoich postów
              </p>
              <Button
                variant="default"
                iconName="Plus"
                onClick={() => fileInputRef.current?.click()}
              >
                Dodaj media
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Save"
              onClick={() => onSave?.()}
            >
              Zapisz szkic
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Clock"
            >
              Zaplanuj
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              onClick={() => onPreview?.()}
            >
              Podgląd
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Send"
              onClick={() => onPublish?.()}
              disabled={!selectedPlatforms || selectedPlatforms.length === 0}
            >
              Opublikuj
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCompositionPanel;