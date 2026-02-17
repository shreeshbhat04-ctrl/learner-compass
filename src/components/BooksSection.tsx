import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchBooks, Book } from '@/services/openLibraryService';

interface BooksSectionProps {
  topic: string;
  subject?: string;
  limit?: number;
}

const BooksSection = ({ topic, subject, limit = 6 }: BooksSectionProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const results = await searchBooks(topic, subject, limit);
        setBooks(results);
        setError(null);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (topic || subject) {
      fetchBooks();
    }
  }, [topic, subject, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading books...</span>
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

  if (books.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No books found for this topic.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book) => (
        <Card key={book.key} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex gap-4 p-4">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-24 h-32 object-cover rounded border border-border"
              />
            ) : (
              <div className="w-24 h-32 bg-muted rounded border border-border flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                by {book.author}
              </p>
              {book.firstPublishYear && (
                <p className="text-xs text-muted-foreground mb-2">
                  Published: {book.firstPublishYear}
                </p>
              )}
              {book.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {book.subjects.slice(0, 2).map((subject, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-muted rounded"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  window.open(
                    `https://openlibrary.org${book.key}`,
                    '_blank'
                  );
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Open Library
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BooksSection;
