# L.E.V.I — Multi-Platform Media Downloader

A full-stack media downloader web application that lets users download videos from Twitter/X and Instagram with one click. Built with vanilla JavaScript, Vercel serverless functions, and Supabase.

🔗 **Live:** [all-for-one-pearl.vercel.app](https://all-for-one-pearl.vercel.app/#platforms)

---

## Features

- ⬇️ Download Twitter/X videos in multiple qualities (1080p, 720p, 480p)
- ⬇️ Download Instagram Reels and video posts
- 🎵 Spotify audio downloader — coming soon
- 📧 Email capture popup with duplicate detection
- 🗄️ Supabase logging for all downloads and subscribers
- 🎨 Animated landing page with real brand SVG icons

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | Supabase (PostgreSQL) |
| Twitter API | fxtwitter open API |
| Instagram API | RapidAPI — Instagram120 |
| Hosting | Vercel |

---

## Project Structure
```
├── index.html          # Landing page
├── index.css           # Landing page styles
├── index.js            # Landing page logic (email popup, Supabase)
├── ig.html             # Instagram downloader page
├── ig.css              # Instagram styles
├── ig.js               # Instagram downloader logic
├── script.js           # Twitter downloader logic
├── style.css           # Twitter styles
├── favicon.png         # Site favicon
└── api/
    ├── video.js        # Twitter/X video fetch + download proxy
    └── instagram.js    # Instagram video fetch + download proxy
```

---

## How It Works

### Twitter/X
1. User pastes a Twitter/X post URL
2. Frontend extracts the tweet ID from the URL
3. Request hits `/api/video` — a Vercel serverless function
4. The function calls fxtwitter's API to get direct `.mp4` URLs
5. User picks a quality and clicks Download
6. Download is proxied through Vercel with the correct `Referer` header to bypass Twitter's CDN restrictions
7. Download is logged to Supabase

### Instagram
1. User pastes an Instagram Reel or post URL
2. Frontend extracts the shortcode from the URL
3. Request hits `/api/instagram` — a Vercel serverless function
4. The function calls RapidAPI's `mediaByShortcode` endpoint
5. User clicks Download
6. Download is proxied through Vercel with correct headers
7. Download is logged to Supabase

---

## Environment Variables

Add these to your Vercel project under **Settings → Environment Variables**:

| Key | Description |
|-----|-------------|
| `RAPIDAPI_KEY` | Your RapidAPI key for Instagram downloads |

---

## Supabase Tables

Run these in your Supabase SQL editor:
```sql
-- Twitter downloads
CREATE TABLE downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_url TEXT NOT NULL,
  tweet_id TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- Instagram downloads
CREATE TABLE ig_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ig_url TEXT NOT NULL,
  shortcode TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- Email subscribers
CREATE TABLE email_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Local Development

Since this uses Vercel serverless functions, you need the Vercel CLI to run it locally:
```bash
npm install -g vercel
vercel dev
```

---

## Credits

Built by **L.E.V.I**, courtesy of [Nuel Sama](https://twitter.com/NuelSama)
