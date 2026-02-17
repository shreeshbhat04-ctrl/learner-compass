import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Book {
  key: string;
  title: string;
  author: string;
  isbn: string | null;
  coverUrl: string | null;
  firstPublishYear: number | null;
  subjects: string[];
}

export interface BooksSearchResponse {
  books: Book[];
}

export const searchBooks = async (
  query: string,
  subject?: string,
  limit: number = 10
): Promise<Book[]> => {
  try {
    const response = await axios.get<BooksSearchResponse>(
      `${API_BASE_URL}/books/search`,
      {
        params: { query, subject, limit },
      }
    );
    return response.data.books;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};
