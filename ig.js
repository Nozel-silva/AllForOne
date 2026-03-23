const SUPABASE_URL = 'https://ccmsjcnuyrngqxwrswfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbXNqY251eXJuZ3F4d3Jzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjU2MjgsImV4cCI6MjA2NzIwMTYyOH0.dkjCo2bgDMf923VKESkyMLsULo7IhmsYb6r-4Dn6SRY';
const fetchBtn = document.getElementById('fetchBtn');
const igUrlInput = document.getElementById('igUrl');
const results = document.getElementById('results');
const historyList = document.getElementById('historyList');

fetchBtn.addEventListener('click', async () => {
  const url = igUrlInput.value.trim();
  results.innerHTML = '';

  if (!url || !url.includes('instagram.com')) {
    results.innerHTML = '<p class="error">Please enter a valid Instagram URL.</p>';
    return;
  }

  fetchBtn.textContent = 'Fetching...';
  fetchBtn.disabled = true;

  try {
    const res = await fetch(`/api/instagram?igUrl=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    displayResults(data);
    await saveToSupabase(url, data.shortcode);
    loadHistory();
  } catch (err) {
    results.innerHTML = `<p class="error">${err.message}</p>`;
  } finally {
    fetchBtn.textContent = 'Get Video';
    fetchBtn.disabled = false;
  }
});

function displayResults(data) {
  const proxyUrl = `/api/instagram?downloadUrl=${encodeURIComponent(data.videoUrl)}&filename=${data.shortcode}_video.mp4`;

  results.innerHTML = `
    <div class="video-card">
      <img src="${data.thumbnail}" alt="Thumbnail" onerror="this.style.display='none'" />
      <div class="caption">${data.caption || 'No caption'}</div>
    </div>
    <a href="${proxyUrl}" class="download-btn" download="${data.shortcode}_video.mp4">Download Video</a>
  `;
}

async function saveToSupabase(url, shortcode) {
  await fetch(`${SUPABASE_URL}/rest/v1/ig_downloads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ ig_url: url, shortcode, downloaded_at: new Date().toISOString() })
  });
}

async function loadHistory() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ig_downloads?order=downloaded_at.desc&limit=5`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();
  historyList.innerHTML = data.map(d => `<li>${d.ig_url} <em>${new Date(d.downloaded_at).toLocaleString()}</em></li>`).join('');
}

loadHistory();
