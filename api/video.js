export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { tweetId } = req.query;
  if (!tweetId) return res.status(400).json({ error: 'No tweet ID provided' });

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
