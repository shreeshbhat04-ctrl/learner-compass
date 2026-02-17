# Learner Compass Backend

Backend API server for code execution using Judge0 API.

## Supported Languages

- **Compiled Languages**: C, C++, Java, C#, Go, Rust
- **Interpreted Languages**: Python, JavaScript
- **Specialized**: MATLAB (Octave), Verilog

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Get a Judge0 API key:
   - Option 1: Sign up at [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) for the Judge0 API
   - Option 2: Self-host Judge0 (see [Judge0 documentation](https://github.com/judge0/judge0))

4. Add your API key to `.env`:
```
JUDGE0_API_KEY=your_api_key_here
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### POST `/api/execute`

Execute code in any supported language.

**Request Body:**
```json
{
  "language": "python",
  "code": "print('Hello, World!')"
}
```

**Response:**
```json
{
  "output": "Hello, World!\n",
  "status": {
    "id": 3,
    "description": "Accepted"
  },
  "time": "0.001s",
  "memory": "1024 KB"
}
```

**Supported Languages:**
- `python` - Python 3.8.1
- `c` - C (GCC 9.2.0)
- `cpp` - C++ (GCC 9.2.0)
- `java` - Java (OpenJDK 13.0.1)
- `javascript` - JavaScript (Node.js 12.14.0)
- `csharp` - C# (Mono 6.6.0.161)
- `go` - Go (1.13.5)
- `rust` - Rust (1.40.0)
- `matlab` - Octave 5.2.0 (MATLAB-compatible)
- `verilog` - Verilog (Icarus Verilog 12.0)

### GET `/api/youtube/search`

Search for educational YouTube videos.

**Query Parameters:**
- `query` (required): Search query string
- `maxResults` (optional): Maximum number of results (default: 10, max: 50)

**Response:**
```json
{
  "videos": [
    {
      "id": "video_id",
      "title": "Video Title",
      "description": "Video description",
      "thumbnail": "thumbnail_url",
      "channelTitle": "Channel Name",
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/api/books/search`

Search for books using Open Library API.

**Query Parameters:**
- `query` (optional): Search query string
- `subject` (optional): Subject filter
- `limit` (optional): Maximum number of results (default: 10, max: 100)

**Response:**
```json
{
  "books": [
    {
      "key": "/works/OL123456W",
      "title": "Book Title",
      "author": "Author Name",
      "isbn": "1234567890",
      "coverUrl": "cover_image_url",
      "firstPublishYear": 2020,
      "subjects": ["Subject1", "Subject2"]
    }
  ]
}
```

### GET `/api/wikipedia/search`

Search for Wikipedia articles.

**Query Parameters:**
- `query` (required): Search query string

**Response:**
```json
{
  "article": {
    "title": "Article Title",
    "extract": "Article summary...",
    "url": "wikipedia_url",
    "thumbnail": "thumbnail_url",
    "description": "Article description"
  }
}
```

Or if multiple results:
```json
{
  "articles": [
    {
      "title": "Article Title",
      "snippet": "Article snippet...",
      "url": "wikipedia_url"
    }
  ]
}
```

## Execution Status Codes

- `3` - Accepted (success)
- `4` - Wrong Answer
- `5` - Time Limit Exceeded
- `6` - Compilation Error
- `7` - Runtime Error
- Other codes indicate various error conditions

## Environment Variables

Add to your `.env` file:

```env
PORT=5000
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

## Notes

- If `JUDGE0_API_KEY` is not set, the server will return simulated output for testing
- If `YOUTUBE_API_KEY` is not set, YouTube search will return an error
- Open Library and Wikipedia APIs are public and don't require API keys
- Execution timeouts and memory limits are handled by Judge0
- The server includes CORS support for frontend integration
- YouTube API has rate limits (10,000 units per day for free tier)