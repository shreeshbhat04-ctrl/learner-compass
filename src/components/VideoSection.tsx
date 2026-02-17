import { useState, useEffect } from 'react';
import { Play, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchYouTubeVideos, YouTubeVideo } from '@/services/youtubeService';

interface VideoSectionProps {
  topic: string;
  maxResults?: number;
}

const VideoSection = ({ topic, maxResults = 6 }: VideoSectionProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const results = await searchYouTubeVideos(topic, maxResults);
        setVideos(results);
        setError(null);
      } catch (err) {
        setError('Failed to load videos. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchVideos();
    }
  }, [topic, maxResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading videos...</span>
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

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No videos found for this topic.</p>
      </div>
    );
  }

  // If only one video requested, show embedded player
  if (maxResults === 1 && videos.length === 1 && !selectedVideo) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videos[0].id}`}
          title={videos[0].title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedVideo ? (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedVideo(null)}
            className="mb-4"
          >
            ← Back to Video List
          </Button>
          <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="relative aspect-video bg-muted">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {video.channelTitle}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Watch on YouTube
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSection;
