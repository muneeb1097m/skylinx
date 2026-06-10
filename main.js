// ── Navbar scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Scroll reveal ──
const reveals = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.08 });
reveals.forEach(el => observer.observe(el));

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Initialize Lucide Icons ──
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  } else {
    // If script loaded with defer, wait for it
    const check = setInterval(() => {
      if (window.lucide) { lucide.createIcons(); clearInterval(check); }
    }, 100);
  }
});

// ── Contact Form Submission to Webhook ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Clear any existing error messages
    const existingError = contactForm.querySelector('.form-error-msg');
    if (existingError) {
      existingError.remove();
    }
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();
    
    // Prepare data payload
    const formData = {
      firstName,
      lastName,
      email,
      company,
      service,
      message,
      submittedAt: new Date().toISOString(),
      sourceUrl: window.location.href
    };
    
    try {
      // Set loading state
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.8';
      submitBtn.innerHTML = `
        <span class="btn-loader" style="display: inline-flex; align-items: center; gap: 0.8rem;">
          <svg class="spinner" viewBox="0 0 50 50" style="width: 20px; height: 20px; animation: rotate 2s linear infinite;">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" style="stroke-linecap: round; animation: dash 1.5s ease-in-out infinite;"></circle>
          </svg>
          Sending...
        </span>
      `;
      
      const response = await fetch('https://services.leadconnectorhq.com/hooks/nwcYVPLp83RO9CvPiUCQ/webhook-trigger/ca3450a8-a6e4-40c6-bde0-9d5c21e22f03', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
        if (response.ok) {
          // Send Lead to Conversions API
          try {
            const leadEventId = 'lead_' + Math.random().toString(36).substring(2, 9);
            await fetch('/api/capi', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventName: 'Lead',
                eventId: leadEventId,
                eventSourceUrl: window.location.href,
                userData: {
                  email: email,
                  firstName: firstName,
                  lastName: lastName
                },
                customData: {
                  value: 0,
                  currency: 'USD',
                  content_category: service
                }
              })
            }).catch(e => console.error('CAPI fetch error:', e));
          } catch (capiErr) {
            console.error('CAPI Lead error:', capiErr);
          }

          // Redirect to the thank you page
          window.location.href = '/thank-you';
        } else {
          throw new Error('Server responded with status ' + response.status);
        }
      } catch (error) {
        console.error('Webhook submission error:', error);
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = originalBtnText;
        
        const errorMsg = document.createElement('p');
        errorMsg.className = 'form-error-msg';
        errorMsg.innerText = 'Unable to send request. Please check your connection and try again.';
        contactForm.appendChild(errorMsg);
      }
    });
  }
}

// ── Meta Conversions API PageView ──
async function sendCAPIPageView() {
  try {
    const eventId = 'pageview_' + Math.random().toString(36).substring(2, 9);
    await fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'PageView',
        eventId: eventId,
        eventSourceUrl: window.location.href
      })
    });
  } catch (err) {
    console.error('CAPI PageView error:', err);
  }
}

// Trigger PageView CAPI event on page load
if (document.readyState === 'complete') {
  sendCAPIPageView();
} else {
  window.addEventListener('load', sendCAPIPageView);
}


