import React from 'react';
import Icon from '../../../components/AppIcon';

const ArticleInsights = ({ article }) => {
  const insights = [
    `Artykuł zawiera ${article?.content?.split(' ')?.length} słów i został opublikowany przez ${article?.author}`,
    `Grupa docelowa: ${article?.targetAudience === 'developers' ? 'Deweloperzy' : 
      article?.targetAudience === 'architects' ? 'Architekci' : 
      article?.targetAudience === 'managers' ? 'Menedżerowie' : 
      article?.targetAudience === 'beginners' ? 'Początkujący' : 
      article?.targetAudience === 'experts' ? 'Eksperci' : 'Mieszana'}`,
    `Wysokie wyniki w kategoriach: ${article?.aiScores?.relevance > 70 ? 'Relevance ' : ''}${article?.aiScores?.novelty > 70 ? 'Novelty ' : ''}${article?.aiScores?.viral > 70 ? 'Viral ' : ''}${article?.aiScores?.value > 70 ? 'Value' : ''}`,
    `Źródło RSS: ${article?.source} - ostatnia aktualizacja ${new Date(article.publishedAt)?.toLocaleDateString('pl-PL')}`
  ];

  const keyTopics = article?.tags || ['React', 'JavaScript', 'Web Development', 'Frontend'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Lightbulb" size={16} className="text-primary" />
        <h4 className="text-sm font-medium text-foreground">Kluczowe informacje AI</h4>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Insights */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Analiza AI
          </h5>
          <ul className="space-y-1">
            {insights?.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Icon name="ArrowRight" size={12} className="text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Topics */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Kluczowe tematy
          </h5>
          <div className="flex flex-wrap gap-2">
            {keyTopics?.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Article Preview */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Podgląd treści
        </h5>
        <p className="text-sm text-foreground leading-relaxed">
          {article?.content?.substring(0, 300)}...
        </p>
      </div>
      {/* Research Materials */}
      {article?.researchMaterials && article?.researchMaterials?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Materiały badawcze
          </h5>
          <div className="space-y-1">
            {article?.researchMaterials?.map((material, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Icon name="ExternalLink" size={12} className="text-muted-foreground" />
                <a
                  href={material?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {material?.title}
                </a>
                <span className="text-muted-foreground">({material?.type})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleInsights;