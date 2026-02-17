import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchWikipedia, WikipediaArticle } from '@/services/wikipediaService';

interface ReferenceSectionProps {
  topic: string;
}

const ReferenceSection = ({ topic }: ReferenceSectionProps) => {
  const [article, setArticle] = useState<WikipediaArticle | null>(null);
  const [articles, setArticles] = useState<WikipediaArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const result = await searchWikipedia(topic);
        
        if (Array.isArray(result)) {
          setArticles(result);
          setArticle(null);
        } else {
          setArticle(result);
          setArticles([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load reference material. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchArticle();
    }
  }, [topic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading reference...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (article) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-4">
          {article.thumbnail && (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-32 h-32 object-cover rounded border border-border"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{article.title}</h3>
            {article.description && (
              <p className="text-sm text-muted-foreground mb-3 italic">
                {article.description}
              </p>
            )}
            {article.extract && (
              <p className="text-sm text-foreground mb-4 leading-relaxed">
                {article.extract}
              </p>
            )}
            <Button
              variant="outline"
              onClick={() => window.open(article.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Full Article on Wikipedia
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (articles.length > 0) {
    return (
      <div className="space-y-4">
        {articles.map((article, idx) => (
          <Card key={idx} className="p-4">
            <h3 className="font-semibold mb-2">{article.title}</h3>
            {article.snippet && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {article.snippet.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Read Article
            </Button>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>No reference material found for this topic.</p>
    </div>
  );
};

export default ReferenceSection;
