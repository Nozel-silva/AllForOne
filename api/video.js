export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { tweetId, downloadUrl } = req.query;

  // Download proxy
  if (downloadUrl) {
    try {
      const videoRes = await fetch(decodeURIComponent(downloadUrl), {
        headers: {
          'Referer': 'https://twitter.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        }
      });

      res.setHeader('Content-Type', 'video/mp4');
      const filename = req.query.filename || 'video.mp4';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const buffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(buffer));
      return;
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fetch video links
  if (tweetId) {
    try {
      const response = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
      const data = await response.json();

      const media = data?.tweet?.media?.videos;
      if (!media || !media.length) return res.status(404).json({ error: 'No video found in this tweet.' });

      const variants = media[0].variants
        .filter(v => v.content_type === 'video/mp4')
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (!variants.length) return res.status(404).json({ error: 'No downloadable video found.' });

      res.status(200).json({ variants });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
        }
