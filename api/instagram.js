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

  // Fetch Instagram video
  if (igUrl) {
    try {
      const cleanUrl = decodeURIComponent(igUrl).split('?')[0];
      const shortcode = cleanUrl.match(/\/(p|reel|tv)\/([^\/]+)/)?.[2];

      if (!shortcode) return res.status(400).json({ error: 'Invalid Instagram URL' });

      const graphqlUrl = `https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${encodeURIComponent(JSON.stringify({ shortcode }))}`;

      const response = await fetch(graphqlUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'X-IG-App-ID': '936619743392459'
        }
      });

      const data = await response.json();
      const media = data?.data?.shortcode_media;

      if (!media) return res.status(404).json({ error: 'Could not fetch video. Post may be private.' });

      if (!media.is_video) return res.status(400).json({ error: 'This post does not contain a video.' });

      const videoUrl = media.video_url;
      const thumbnail = media.thumbnail_src;
      const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text || '';

      res.status(200).json({ videoUrl, thumbnail, caption, shortcode });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
