import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

const PostCompositionPanel = ({
  platform,
  postContent,
  generatedPost,
  isGenerating,
  selectedTone,
  onContentChange,
  onToneChange,
  onGeneratePost,
  onSchedulePost,
  onPublishNow,
  platformLimits
}) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [hashtagCount, setHashtagCount] = useState(0);

  const toneOptions = [
    { id: 'professional', name: 'Profesjonalny', description: 'Formalny, biznesowy ton' },
    { id: 'casual', name: 'Swobodny', description: 'Przyjazny, luźny styl' },
    { id: 'engaging', name: 'Angażujący', description: 'Dynamiczny, zachęcający' },
    { id: 'informative', name: 'Informacyjny', description: 'Edukacyjny, faktyczny' }
  ];

  const platformConfig = {
    blog: { 
      maxLength: 2000, 
      icon: 'FileText',
      color: 'bg-blue-500',
      placeholder: 'Napisz szczegółowy wpis na blog...'
    },
    twitter: { 
      maxLength: 280, 
      icon: 'Twitter',
      color: 'bg-sky-500',
      placeholder: 'Co się dzieje? Podziel się swoimi przemyśleniami...'
    },
    linkedin: { 
      maxLength: 3000, 
      icon: 'Linkedin',
      color: 'bg-blue-700',
      placeholder: 'Podziel się profesjonalnymi spostrzeżeniami...'
    },
    instagram: { 
      maxLength: 2200, 
      icon: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      placeholder: 'Stwórz angażującą historię...'
    }
  };

  const config = platformConfig?.[platform] || platformConfig?.twitter;

  useEffect(() => {
    const count = postContent?.length || 0;
    setCharacterCount(count);
    
    const hashtags = (postContent?.match(/#\w+/g) || [])?.length;
    setHashtagCount(hashtags);
  }, [postContent]);

  const getCharacterCountColor = () => {
    const ratio = characterCount / config?.maxLength;
    if (ratio > 1) return 'text-error';
    if (ratio > 0.8) return 'text-warning';
    return 'text-muted-foreground';
  };

  const handleContentChange = (e) => {
    onContentChange?.(e?.target?.value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg", config?.color)}>
              <Icon name={config?.icon} size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {platform?.charAt(0)?.toUpperCase() + platform?.slice(1)} Post
              </h2>
              <p className="text-sm text-muted-foreground">
                Limit: {config?.maxLength} znaków
              </p>
            </div>
          </div>

          <Button
            variant="default"
            size="sm"
            iconName="Zap"
            loading={isGenerating}
            onClick={onGeneratePost}
          >
            Generuj AI
          </Button>
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Ton wypowiedzi
          </label>
          <div className="grid grid-cols-2 gap-2">
            {toneOptions?.map((tone) => (
              <button
                key={tone?.id}
                onClick={() => onToneChange?.(tone?.id)}
                className={cn(
                  "p-3 text-left rounded-lg border transition-colors",
                  selectedTone === tone?.id 
                    ? "border-primary bg-primary/5 text-primary" :"border-border bg-background hover:bg-muted/50"
                )}
              >
                <div className="font-medium text-sm">{tone?.name}</div>
                <div className="text-xs text-muted-foreground">{tone?.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Composition Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Generated Post Preview */}
          {generatedPost && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name="Sparkles" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Post wygenerowany przez AI
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  iconName="Copy"
                  onClick={() => onContentChange?.(generatedPost?.content)}
                >
                  Kopiuj
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {generatedPost?.content}
                </div>
                
                {/* Generated Hashtags */}
                {generatedPost?.hashtags && (
                  <div className="flex flex-wrap gap-1">
                    {generatedPost?.hashtags?.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Suggestions */}
                {generatedPost?.engagementHooks && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Sugestie angażowania:
                    </h5>
                    <ul className="space-y-1">
                      {generatedPost?.engagementHooks?.slice(0, 2)?.map((hook, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                          <span>•</span>
                          <span>{hook}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Composition Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Treść posta
            </label>
            <textarea
              value={postContent}
              onChange={handleContentChange}
              placeholder={config?.placeholder}
              className={cn(
                "w-full h-64 px-3 py-2 text-sm border rounded-lg resize-none",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "placeholder:text-muted-foreground",
                characterCount > config?.maxLength 
                  ? "border-error focus:ring-error" :"border-input"
              )}
            />
            
            {/* Character Counter */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                <span className={getCharacterCountColor()}>
                  {characterCount}/{config?.maxLength} znaków
                </span>
                {hashtagCount > 0 && (
                  <span className="text-muted-foreground">
                    {hashtagCount} hashtag{hashtagCount > 1 ? 'i' : ''}
                  </span>
                )}
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded",
                characterCount > config?.maxLength 
                  ? "bg-error/10 text-error" 
                  : characterCount > config?.maxLength * 0.8 
                  ? "bg-warning/10 text-warning" :"bg-success/10 text-success"
              )}>
                {characterCount > config?.maxLength ? 'Przekroczono limit' : 'OK'}
              </div>
            </div>
          </div>

          {/* Preview Mode Toggle */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Podgląd posta
            </h4>
            <div className={cn(
              "p-3 rounded border bg-card",
              "min-h-16 whitespace-pre-wrap text-sm"
            )}>
              {postContent || (
                <span className="text-muted-foreground italic">
                  {config?.placeholder}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="p-6 border-t border-border bg-muted/10">
        <div className="flex items-center justify-between space-x-3">
          <div className="text-xs text-muted-foreground">
            {generatedPost?.bestPostingTime && (
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={12} />
                <span>Najlepszy czas: {generatedPost?.bestPostingTime}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Calendar"
              onClick={onSchedulePost}
              disabled={!postContent?.trim()}
            >
              Zaplanuj
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Send"
              onClick={onPublishNow}
              disabled={!postContent?.trim() || characterCount > config?.maxLength}
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