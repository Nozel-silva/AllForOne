export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { igUrl, downloadUrl, filename } = req.query;

  // Proxy download
  if (downloadUrl) {
    try {
      const mediaRes = await fetch(decodeURIComponent(downloadUrl), {
        headers: {
          'Referer': 'https://www.instagram.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const contentType = mediaRes.headers.get('content-type') || 'video/mp4';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'video.mp4'}"`);

      const buffer = await mediaRes.arrayBuffer();
      res.send(Buffer.from(buffer));
      return;
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fetch Instagram video via RapidAPI
  if (igUrl) {
    try {
      const cleanUrl = decodeURIComponent(igUrl).split('?')[0];
      const shortcode = cleanUrl.match(/\/(p|reel|tv)\/([^\/]+)/)?.[2];

      if (!shortcode) return res.status(400).json({ error: 'Invalid Instagram URL' });

      const response = await fetch('https://instagram120.p.rapidapi.com/api/instagram/mediaByShortcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'instagram120.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY
        },
        body: JSON.stringify({ shortcode })
      });

      const data = await response.json();
      return res.status(200).json({ debug: data });

      if (!data || data.error) return res.status(404).json({ error: 'No video found. Post may be private.' });

      const videoUrl = data?.video_url || data?.items?.[0]?.video_url || null;
      const thumbnail = data?.thumbnail_url || data?.display_url || data?.items?.[0]?.thumbnail_url || '';
      const caption = data?.caption || data?.edge_media_to_caption?.edges?.[0]?.node?.text || '';

      if (!videoUrl) return res.status(404).json({ error: 'No video found in this post.' });

      res.status(200).json({ videoUrl, thumbnail, caption, shortcode });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
        }
