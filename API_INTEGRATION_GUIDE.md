# API Integration Guide

This guide explains how to set up and use the YouTube, Open Library, and Wikipedia API integrations.

## Overview

The application now integrates three external APIs to provide comprehensive educational content:

1. **YouTube Data API v3** - Educational video content
2. **Open Library API** - Textbook references and reading materials
3. **Wikipedia REST API** - Concept explanations and reference material

## Setup Instructions

### 1. YouTube Data API v3

#### Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "YouTube Data API v3"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

#### Add to Backend
Add to `learner-compass/backend/.env`:
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### Rate Limits
- Free tier: 10,000 units per day
- Each search request costs 100 units
- Approximately 100 searches per day

### 2. Open Library API

**No API key required!** Open Library is a free, public API.

The API is automatically configured and ready to use.

### 3. Wikipedia API

**No API key required!** Wikipedia REST API is public and free.

The API is automatically configured and ready to use.

## Backend Endpoints

### YouTube Search
```
GET /api/youtube/search?query=python+tutorial&maxResults=10
```

### Books Search
```
GET /api/books/search?query=python+programming&limit=10
GET /api/books/search?subject=computer+science&limit=10
```

### Wikipedia Search
```
GET /api/wikipedia/search?query=python+programming
```

## Frontend Components

### VideoSection
Displays YouTube videos related to a topic.

```tsx
import VideoSection from '@/components/VideoSection';

<VideoSection topic="Python Programming" maxResults={6} />
```

### BooksSection
Displays recommended books from Open Library.

```tsx
import BooksSection from '@/components/BooksSection';

<BooksSection topic="Python Programming" subject="computer science" limit={6} />
```

### ReferenceSection
Displays Wikipedia articles for concept explanations.

```tsx
import ReferenceSection from '@/components/ReferenceSection';

<ReferenceSection topic="Python Programming" />
```

## Usage in CoursePlayer

The CoursePlayer component now includes three new tabs:

1. **Videos Tab** - Shows educational YouTube videos
2. **Books Tab** - Shows recommended textbooks
3. **References Tab** - Shows Wikipedia articles

These tabs automatically search for content based on the course title and track subject.

## Testing

### Test YouTube API
```bash
curl "http://localhost:5000/api/youtube/search?query=python+tutorial&maxResults=5"
```

### Test Books API
```bash
curl "http://localhost:5000/api/books/search?query=python+programming&limit=5"
```

### Test Wikipedia API
```bash
curl "http://localhost:5000/api/wikipedia/search?query=python+programming"
```

## Error Handling

All components include:
- Loading states while fetching data
- Error messages if API calls fail
- Empty states when no results are found
- Graceful fallbacks

## Troubleshooting

### YouTube API Not Working
- Verify API key is set in `.env`
- Check API key is enabled for YouTube Data API v3
- Verify you haven't exceeded daily quota
- Check browser console for error messages

### Books/Wikipedia Not Loading
- Check backend server is running
- Verify network connectivity
- Check browser console for CORS errors
- These APIs are public, so they should work without issues

## Next Steps

1. Set up YouTube API key
2. Restart backend server
3. Test API endpoints
4. View content in CoursePlayer

Happy Learning! 🎓
