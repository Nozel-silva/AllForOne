const SUPABASE_URL = 'https://ccmsjcnuyrngqxwrswfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbXNqY251eXJuZ3F4d3Jzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjU2MjgsImV4cCI6MjA2NzIwMTYyOH0.dkjCo2bgDMf923VKESkyMLsULo7IhmsYb6r-4Dn6SRY';

const fetchBtn = document.getElementById('fetchBtn');
const tweetUrlInput = document.getElementById('tweetUrl');
const results = document.getElementById('results');
const historyList = document.getElementById('historyList');

fetchBtn.addEventListener('click', async () => {
  const url = tweetUrlInput.value.trim();
  results.innerHTML = '';

  if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
    results.innerHTML = '<p class="error">Please enter a valid Twitter/X URL.</p>';
    return;
  }

  fetchBtn.textContent = 'Fetching...';
  fetchBtn.disabled = true;

  try {
    const tweetId = extractTweetId(url);
    if (!tweetId) throw new Error('Could not extract tweet ID.');

    const videoData = await fetchVideoLinks(tweetId);
    displayResults(videoData, url);
    await saveToSupabase(url, tweetId);
    loadHistory();
  } catch (err) {
    results.innerHTML = `<p class="error">${err.message}</p>`;
  } finally {
    fetchBtn.textContent = 'Get Video';
    fetchBtn.disabled = false;
  }
});

function extractTweetId(url) {
  const patterns = [
    /status\/(\d+)/,
    /statuses\/(\d+)/,
    /\/(\d{10,})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function fetchVideoLinks(tweetId) {
  const res = await fetch(`/api/video?tweetId=${tweetId}`);
  const data = await res.json();

  if (data.error) throw new Error(data.error);

  return data.variants;
}

function displayResults(variants, originalUrl) {
  if (!variants.length) {
    results.innerHTML = '<p class="error">No downloadable video found.</p>';
    return;
  }

  results.innerHTML = variants.map(v => {
    const quality = v.height ? `${v.height}p` : 'Download';
    return `
      <div class="video-option">
        <span>${quality} — ${v.bitrate ? (v.bitrate / 1000).toFixed(0) + ' kbps' : ''}</span>
        <a href="${v.url}" download target="_blank">Download</a>
      </div>
    `;
  }).join('');
}

async function saveToSupabase(url, tweetId) {
  await fetch(`${SUPABASE_URL}/rest/v1/downloads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ tweet_url: url, tweet_id: tweetId, downloaded_at: new Date().toISOString() })
  });
}

async function loadHistory() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/downloads?order=downloaded_at.desc&limit=5`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();
  historyList.innerHTML = data.map(d => `<li>${d.tweet_url} <em>${new Date(d.downloaded_at).toLocaleString()}</em></li>`).join('');
}

loadHistory();
