
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, Clock } from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails?: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string;
  };
}

interface TopVideosTableProps {
  videos: VideoData[];
}

export function TopVideosTable({ videos }: TopVideosTableProps) {
  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: string) => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
  };

  const getThumbnailUrl = (video: VideoData) => {
    console.log(`Getting thumbnail for video ${video.id}:`, {
      hasThumbnails: !!video.thumbnails,
      thumbnailKeys: video.thumbnails ? Object.keys(video.thumbnails) : [],
      thumbnailsData: video.thumbnails
    });

    // Handle cases where thumbnails might be undefined
    if (!video.thumbnails) {
      console.log(`No thumbnails object for video ${video.id}`);
      return '/placeholder.svg';
    }

    // Try different thumbnail sizes in order of preference
    const thumbnailUrl = video.thumbnails.high?.url || 
                        video.thumbnails.medium?.url || 
                        video.thumbnails.default?.url;

    if (!thumbnailUrl) {
      console.log(`No valid thumbnail URL found for video ${video.id}`, video.thumbnails);
      return '/placeholder.svg';
    }

    console.log(`Using thumbnail URL for video ${video.id}:`, thumbnailUrl);
    return thumbnailUrl;
  };

  console.log('TopVideosTable received videos:', {
    count: videos.length,
    firstVideoThumbnails: videos[0]?.thumbnails,
    allVideoThumbnails: videos.map(v => ({ id: v.id, hasThumbnails: !!v.thumbnails })).slice(0, 3)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vídeos mais visualizados
        </CardTitle>
        <CardDescription>
          Seus vídeos com melhor desempenho
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.slice(0, 10).map((video, index) => {
            const thumbnailUrl = getThumbnailUrl(video);
            
            return (
              <div 
                key={video.id} 
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 text-lg font-bold text-muted-foreground w-6">
                  {index + 1}
                </div>
                
                <div className="relative flex-shrink-0">
                  <img 
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded-md"
                    onError={(e) => {
                      console.log('Thumbnail failed to load:', thumbnailUrl);
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                    {formatDuration(video.contentDetails?.duration || '')}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2 mb-2">
                    {video.title}
                  </h4>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(video.statistics.viewCount)} visualizações
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{formatNumber(video.statistics.likeCount)} curtidas</span>
                      <span>{formatNumber(video.statistics.commentCount)} comentários</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Abrir
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
