import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface WikipediaArticle {
  title: string;
  extract?: string;
  snippet?: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface WikipediaSearchResponse {
  article?: WikipediaArticle;
  articles?: WikipediaArticle[];
}

export const searchWikipedia = async (
  query: string
): Promise<WikipediaArticle | WikipediaArticle[]> => {
  try {
    const response = await axios.get<WikipediaSearchResponse>(
      `${API_BASE_URL}/wikipedia/search`,
      {
        params: { query },
      }
    );
    
    if (response.data.article) {
      return response.data.article;
    } else if (response.data.articles) {
      return response.data.articles;
    }
    
    throw new Error('No articles found');
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    throw error;
  }
};
