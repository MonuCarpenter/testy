import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
}

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("YouTube API key is not configured");
    }

    const response = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults,
      relevanceLanguage: "en",
      safeSearch: "strict",
      videoDefinition: "high",
      videoEmbeddable: "true",
      order: "relevance",
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    const videos: YouTubeVideo[] = response.data.items.map((item) => ({
      id: item.id?.videoId || "",
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",
      channelTitle: item.snippet?.channelTitle || "",
      publishedAt: item.snippet?.publishedAt || "",
    }));

    return videos.filter((video) => video.id);
  } catch (error: any) {
    console.error("YouTube API error:", error);
    throw new Error(
      error.message || "Failed to fetch YouTube videos. Please try again later."
    );
  }
}

export async function getStudyVideosForSubject(
  subject: string,
  specificTopics?: string[]
): Promise<YouTubeVideo[]> {
  const searchQueries: string[] = [];

  if (specificTopics && specificTopics.length > 0) {
    // Search for specific topics within the subject
    specificTopics.forEach((topic) => {
      searchQueries.push(`${subject} ${topic} tutorial`);
    });
  } else {
    // General subject search
    searchQueries.push(`${subject} study tutorial`);
    searchQueries.push(`${subject} explained`);
  }

  // Get videos for the first search query (we can expand this later)
  const primaryQuery = searchQueries[0];
  return await searchYouTubeVideos(primaryQuery, 6);
}
