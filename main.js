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
            fetch('/api/capi', {
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

          // Build premium success state
          contactForm.innerHTML = `
            <div class="success-message" style="text-align: center; padding: 1.5rem 0;">
              <div class="success-icon-wrap" style="width: 80px; height: 80px; border-radius: 50%; background: rgba(81,207,102,0.1); border: 2px solid #51cf66; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 0 30px rgba(81,207,102,0.2); animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;">
                <i data-lucide="check" style="width: 40px; height: 40px; stroke: #51cf66; stroke-width: 3;"></i>
              </div>
              <h3 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 1rem; color: #fff; background: linear-gradient(135deg, #fff 30%, var(--blue-light) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">Thank You, ${firstName}!</h3>
              <p style="color: var(--muted); line-height: 1.7; font-size: 0.95rem; margin-bottom: 2rem;">We have received your discovery call request. One of our senior product partners will reach out to <strong>${email}</strong> within 1 business day.</p>
              <div style="padding: 1.2rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; font-size: 0.85rem; color: #fff; text-align: left;">
                <span style="display: block; font-weight: 700; color: var(--blue-light); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">What's Next?</span>
                We'll send you an invitation to choose a convenient time slot for our 45-minute strategy call.
              </div>
            </div>
          `;
          
          // Re-initialize lucide icons for the new HTML content
          if (window.lucide) {
            window.lucide.createIcons();
          }
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


