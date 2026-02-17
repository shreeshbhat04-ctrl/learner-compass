const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Judge0 Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Get from RapidAPI or self-hosted

// Language IDs for Judge0 API
// Reference: https://ce.judge0.com/#statuses-and-languages-language-get
const LANGUAGES = {
    python: 71,      // Python 3.8.1
    c: 50,           // C (GCC 9.2.0)
    cpp: 54,         // C++ (GCC 9.2.0)
    csharp: 51,      // C# (Mono 6.6.0.161)
    java: 62,        // Java (OpenJDK 13.0.1)
    javascript: 63,  // JavaScript (Node.js 12.14.0)
    typescript: 74,  // TypeScript (Node.js 12.14.0)
    matlab: 66,      // Octave 5.2.0 (MATLAB-compatible)
    verilog: 82,     // Verilog (Icarus Verilog 12.0)
    go: 60,          // Go (1.13.5)
    rust: 73,        // Rust (1.40.0)
    php: 68,         // PHP (7.4.1)
    ruby: 72,        // Ruby (2.7.0)
    swift: 83,       // Swift (5.2.3)
    kotlin: 78,      // Kotlin (1.3.70)
    scala: 81,       // Scala (2.13.2)
    r: 80,           // R (4.0.0)
    sql: 82          // SQL (SQLite 3.27.2) - Note: Using Verilog ID as placeholder
};

// Health Check
app.get('/', (req, res) => {
    res.send('Learner Compass Backend is running');
});

// Execute Code Endpoint
app.post('/api/execute', async (req, res) => {
    const { language, code } = req.body;

    if (!LANGUAGES[language]) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    try {
        const submissionData = {
            language_id: LANGUAGES[language],
            source_code: code,
            stdin: "",
        };

        // 1. Submit Code
        const submissionResponse = await axios.post(
            `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
            submissionData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": JUDGE0_API_KEY,
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                },
            }
        );

        const result = submissionResponse.data;

        // 2. Format output based on status
        let output = "";
        if (result.status.id === 3) {
            // Accepted - show stdout
            output = result.stdout || "Program executed successfully with no output.";
        } else if (result.status.id === 4) {
            // Wrong Answer - show stdout and stderr
            output = (result.stdout || "") + (result.stderr ? "\n" + result.stderr : "");
        } else if (result.status.id === 5) {
            // Time Limit Exceeded
            output = "Time Limit Exceeded\n" + (result.stdout || "");
        } else if (result.status.id === 6) {
            // Compilation Error
            output = "Compilation Error:\n" + (result.compile_output || result.stderr || "Unknown compilation error");
        } else if (result.status.id === 7) {
            // Runtime Error
            output = "Runtime Error:\n" + (result.stderr || result.stdout || "Unknown runtime error");
        } else {
            // Other statuses
            output = result.stdout || result.stderr || result.compile_output || "No output";
        }

        // 3. Return Result
        res.json({
            output: output,
            status: result.status,
            time: result.time ? `${result.time}s` : null,
            memory: result.memory ? `${result.memory} KB` : null,
            exitCode: result.exit_code,
            exitSignal: result.exit_signal
        });

    } catch (error) {
        console.error("Execution Error:", error.response?.data || error.message);
        // Fallback for demo if no API key
        if (!JUDGE0_API_KEY) {
            return res.json({
                output: "Simulated Output (Backend): Judge0 API Key missing.\n" +
                    `Language: ${language}\n` +
                    "Code received length: " + code.length,
                status: { description: "Simulated Success" }
            });
        }
        res.status(500).json({ error: "Failed to execute code" });
    }
});

// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

// Open Library API (no key required)
const OPEN_LIBRARY_API_URL = "https://openlibrary.org";

// Wikipedia API (no key required)
const WIKIPEDIA_API_URL = "https://en.wikipedia.org/api/rest_v1";

// YouTube Search Endpoint
app.get('/api/youtube/search', async (req, res) => {
    const { query, maxResults = 10 } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: "YouTube API key not configured" });
    }

    try {
        const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: Math.min(parseInt(maxResults), 50),
                key: YOUTUBE_API_KEY,
                videoCategoryId: '27', // Education category
                order: 'relevance'
            }
        });

        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));

        res.json({ videos });
    } catch (error) {
        console.error("YouTube API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to search YouTube videos" });
    }
});

// Open Library Search Endpoint
app.get('/api/books/search', async (req, res) => {
    const { query, subject, limit = 10 } = req.query;

    if (!query && !subject) {
        return res.status(400).json({ error: "Query or subject parameter is required" });
    }

    try {
        const searchQuery = subject ? `subject:${subject}` : query;
        const response = await axios.get(`${OPEN_LIBRARY_API_URL}/search.json`, {
            params: {
                q: searchQuery,
                limit: Math.min(parseInt(limit), 100)
            }
        });

        const books = await Promise.all(
            response.data.docs.slice(0, parseInt(limit)).map(async (book) => {
                // Get book details
                const workKey = book.key;
                let coverUrl = null;
                let isbn = null;

                if (book.isbn) {
                    isbn = Array.isArray(book.isbn) ? book.isbn[0] : book.isbn;
                    coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
                } else if (book.cover_i) {
                    coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
                }

                return {
                    key: workKey,
                    title: book.title,
                    author: book.author_name?.[0] || "Unknown Author",
                    isbn: isbn,
                    coverUrl: coverUrl,
                    firstPublishYear: book.first_publish_year,
                    subjects: book.subject?.slice(0, 5) || []
                };
            })
        );

        res.json({ books });
    } catch (error) {
        console.error("Open Library API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to search books" });
    }
});

// Wikipedia Search Endpoint
app.get('/api/wikipedia/search', async (req, res) => {
    const { query, limit = 5 } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        // First, search for articles
        const searchResponse = await axios.get(`${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'LearnerCompass/1.0'
            }
        });

        const article = {
            title: searchResponse.data.title,
            extract: searchResponse.data.extract,
            url: searchResponse.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            thumbnail: searchResponse.data.thumbnail?.source,
            description: searchResponse.data.description
        };

        res.json({ article });
    } catch (error) {
        // If direct page not found, try search
        if (error.response?.status === 404) {
            try {
                const searchResponse = await axios.get(`https://en.wikipedia.org/w/api.php`, {
                    params: {
                        action: 'query',
                        list: 'search',
                        srsearch: query,
                        format: 'json',
                        srlimit: Math.min(parseInt(limit), 10)
                    },
                    headers: {
                        'User-Agent': 'LearnerCompass/1.0'
                    }
                });

                const articles = searchResponse.data.query.search.map(item => ({
                    title: item.title,
                    snippet: item.snippet,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`
                }));

                res.json({ articles });
            } catch (searchError) {
                console.error("Wikipedia Search Error:", searchError.response?.data || searchError.message);
                res.status(500).json({ error: "Failed to search Wikipedia" });
            }
        } else {
            console.error("Wikipedia API Error:", error.response?.data || error.message);
            res.status(500).json({ error: "Failed to fetch Wikipedia article" });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
