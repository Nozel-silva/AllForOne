const SUPABASE_URL = 'https://ccmsjcnuyrngqxwrswfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbXNqY251eXJuZ3F4d3Jzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjU2MjgsImV4cCI6MjA2NzIwMTYyOH0.dkjCo2bgDMf923VKESkyMLsULo7IhmsYb6r-4Dn6SRY';

const popupOverlay = document.getElementById('popupOverlay');
const emailInput = document.getElementById('emailInput');
const submitEmail = document.getElementById('submitEmail');
const popupError = document.getElementById('popupError');

submitEmail.addEventListener('click', async () => {
  const email = emailInput.value.trim();

  if (!email || !email.includes('@')) {
    popupError.textContent = 'Please enter a valid email address.';
    return;
  }

  submitEmail.textContent = 'Processing...';
  submitEmail.disabled = true;
  popupError.textContent = '';

  try {
    // Check if email already exists
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/email_subscribers?email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const existing = await checkRes.json();

    if (existing.length > 0) {
      // Email exists, just close
      closePopup();
      return;
    }

    // Email doesn't exist, save it
    await fetch(`${SUPABASE_URL}/rest/v1/email_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ email })
    });

    closePopup();

  } catch (err) {
    popupError.textContent = 'Something went wrong. Please try again.';
  } finally {
    submitEmail.textContent = 'Continue';
    submitEmail.disabled = false;
  }
});

function closePopup() {
  popupOverlay.classList.add('hidden');
}

// Animate cards on scroll
const cards = document.querySelectorAll('.card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${i * 0.15}s`;
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

cards.forEach(card => observer.observe(card));
