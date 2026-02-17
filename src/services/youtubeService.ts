import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
}

export const searchYouTubeVideos = async (
  query: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> => {
  try {
    const response = await axios.get<YouTubeSearchResponse>(
      `${API_BASE_URL}/youtube/search`,
      {
        params: { query, maxResults },
      }
    );
    return response.data.videos;
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};
