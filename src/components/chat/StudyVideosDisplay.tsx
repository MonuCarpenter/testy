import { ExternalLink, Play, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface StudyVideosDisplayProps {
  subject: string;
  avgScore: number;
  suggestion: string;
  videos: YouTubeVideo[];
  onClose: () => void;
}

export default function StudyVideosDisplay({
  subject,
  avgScore,
  suggestion,
  videos,
  onClose,
}: StudyVideosDisplayProps) {
  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 mb-3 border-2 border-red-200 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
            📺 Study Videos: {subject}
          </h3>
          <p className="text-sm text-red-600 mt-1">{suggestion}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-red-600 hover:text-red-800 hover:bg-red-100"
        >
          ✕
        </Button>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow-sm border border-red-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openVideo(video.id)}
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2">
                  {video.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <User className="w-3 h-3" />
                  <span className="truncate">{video.channelTitle}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {truncateText(video.description, 100)}
                </p>

                <Button
                  size="sm"
                  className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    openVideo(video.id);
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Watch on YouTube
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No videos found for this subject.</p>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> These videos are curated based on your weak
          subjects. Watch them to improve your understanding!
        </p>
      </div>
    </div>
  );
}
