const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API Configuration
const TMDB_API_KEY = 'a265afc040fdf1f14350f04354bbc086';
const YOUTUBE_API_KEY = 'AIzaSyB5ijZsvQi2mv1Y43BPDR3P6v4plgk2Uhg';
const SPORTSDB_API_KEY = '8391dabe3ea84cab9a412cec43b2148d';

// Movie Routes
app.get('/api/movies/popular', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
            params: { api_key: TMDB_API_KEY, page: page, language: 'en-US' }
        });
        res.json(response.data);
    } catch (error) {
        res.json({ results: [] });
    }
});

app.get('/api/movies/search', async (req, res) => {
    try {
        const query = req.query.q;
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
            params: { api_key: TMDB_API_KEY, query: query, language: 'en-US' }
        });
        res.json(response.data);
    } catch (error) {
        res.json({ results: [] });
    }
});

app.get('/api/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            params: { api_key: TMDB_API_KEY, language: 'en-US', append_to_response: 'videos,credits' }
        });
        res.json(response.data);
    } catch (error) {
        res.json({});
    }
});

// Music Routes
app.get('/api/music/search', async (req, res) => {
    try {
        const term = req.query.term;
        const response = await axios.get('https://itunes.apple.com/search', {
            params: { term: term, entity: 'song', limit: 30 }
        });
        res.json(response.data);
    } catch (error) {
        res.json({ results: [] });
    }
});

// Upload Configuration
const UPLOAD_ROOT = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = req.body.category || 'misc';
        const dir = path.join(UPLOAD_ROOT, category);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        cb(null, base + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✨ LoufHub running on http://localhost:${port}`));