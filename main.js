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

// ── Google Sheets Webhook / Apps Script Endpoint URL ──
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbythFxzTrmCUYwxwemv5nUKrKD6O-IQ5CzozuJJ3uJAYd7E-IIPtOyt4ThubVeYL-mu2g/exec';

// ── Custom Select Dropdown Component Logic ──
const csWrapper = document.getElementById('customSelectWrapper');
const csTrigger = document.getElementById('customSelectTrigger');
const csSelectedText = document.getElementById('csSelectedText');
const realSelect = document.getElementById('service');
const csOptions = document.querySelectorAll('.cs-option');

if (csWrapper && csTrigger && realSelect) {
  csTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    csWrapper.classList.toggle('open');
  });

  csOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-value');
      const title = opt.querySelector('strong') ? opt.querySelector('strong').innerText : val;

      realSelect.value = val;
      csSelectedText.innerText = title;
      csSelectedText.classList.remove('placeholder');

      csOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      csWrapper.classList.remove('open');
    });
  });

  document.addEventListener('click', () => {
    csWrapper.classList.remove('open');
  });
}

// ── 3-Layer Multi-Step Form Logic ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const layer1 = document.getElementById('layer1');
  const layer2 = document.getElementById('layer2');
  const layer3 = document.getElementById('layer3');
  
  const stepInd1 = document.getElementById('stepInd1');
  const stepInd2 = document.getElementById('stepInd2');
  const stepInd3 = document.getElementById('stepInd3');
  
  const stepLine1 = document.getElementById('stepLine1');
  const stepLine2 = document.getElementById('stepLine2');
  const progressFill = document.getElementById('progressFill');

  const nextToStep2Btn = document.getElementById('nextToStep2Btn');
  const nextToStep3Btn = document.getElementById('nextToStep3Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const backToStep2Btn = document.getElementById('backToStep2Btn');

  function showFormError(msg, layerEl) {
    let err = layerEl.querySelector('.form-error-msg');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error-msg';
      layerEl.appendChild(err);
    }
    err.innerText = msg;
  }

  function clearFormError(layerEl) {
    const err = layerEl.querySelector('.form-error-msg');
    if (err) err.remove();
  }

  // Go to Step 2 from Step 1
  if (nextToStep2Btn) {
    nextToStep2Btn.addEventListener('click', () => {
      clearFormError(layer1);
      const fullName = document.getElementById('fullName').value.trim();
      const company = document.getElementById('company').value.trim();

      if (!fullName || !company) {
        showFormError('Please fill in your Full Name and Company Name.', layer1);
        return;
      }

      layer1.classList.remove('active');
      layer2.classList.add('active');

      stepInd1.classList.remove('active');
      stepInd1.classList.add('completed');
      stepLine1.classList.add('active');

      stepInd2.classList.add('active');
      progressFill.style.width = '66.66%';
    });
  }

  // Back to Step 1 from Step 2
  if (backToStep1Btn) {
    backToStep1Btn.addEventListener('click', () => {
      clearFormError(layer2);
      layer2.classList.remove('active');
      layer1.classList.add('active');

      stepInd2.classList.remove('active');
      stepInd1.classList.remove('completed');
      stepInd1.classList.add('active');
      stepLine1.classList.remove('active');

      progressFill.style.width = '33.33%';
    });
  }

  // Go to Step 3 from Step 2
  if (nextToStep3Btn) {
    nextToStep3Btn.addEventListener('click', () => {
      clearFormError(layer2);
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();

      if (!email || !email.includes('@')) {
        showFormError('Please enter a valid work email address.', layer2);
        return;
      }
      if (!phone) {
        showFormError('Please enter your phone number.', layer2);
        return;
      }

      layer2.classList.remove('active');
      layer3.classList.add('active');

      stepInd2.classList.remove('active');
      stepInd2.classList.add('completed');
      stepLine2.classList.add('active');

      stepInd3.classList.add('active');
      progressFill.style.width = '100%';
    });
  }

  // Back to Step 2 from Step 3
  if (backToStep2Btn) {
    backToStep2Btn.addEventListener('click', () => {
      clearFormError(layer3);
      layer3.classList.remove('active');
      layer2.classList.add('active');

      stepInd3.classList.remove('active');
      stepInd2.classList.remove('completed');
      stepInd2.classList.add('active');
      stepLine2.classList.remove('active');

      progressFill.style.width = '66.66%';
    });
  }

  // Final Form Submission on Layer 3
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError(layer3);

    const fullName = document.getElementById('fullName').value.trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
    const website = document.getElementById('website') ? document.getElementById('website').value.trim() : '';
    const company = document.getElementById('company').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    if (!service) {
      showFormError('Please select what process you are looking to automate.', layer3);
      return;
    }
    if (!message || message.length < 20) {
      showFormError('Please provide a brief description of your manual challenge (at least 20 characters).', layer3);
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Prepare data payload
    const formData = {
      fullName,
      firstName,
      lastName,
      email,
      phone,
      website,
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
          Submitting...
        </span>
      `;

      // 1. Submit to Google Sheet endpoint using robust form urlencoded body to bypass CORS/parsing issues
      if (GOOGLE_SHEET_WEBHOOK_URL) {
        fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams(formData)
        }).catch(err => console.error('Google Sheet Sync Error:', err));
      }

      // 2. Send Lead to Conversions API
      try {
        const leadEventId = 'lead_' + Math.random().toString(36).substring(2, 9);
        
        // Track browser pixel Lead event with eventID for deduplication
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            value: 0,
            currency: 'USD',
            content_category: service
          }, { eventID: leadEventId });
        }

        fetch('/api/capi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'Lead',
            eventId: leadEventId,
            eventSourceUrl: window.location.href,
            userData: {
              email: email,
              phone: phone,
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

      // 3. Submit to LeadConnector Webhook & Redirect to thank-you.html
      try {
        await fetch('https://services.leadconnectorhq.com/hooks/nwcYVPLp83RO9CvPiUCQ/webhook-trigger/ca3450a8-a6e4-40c6-bde0-9d5c21e22f03', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } catch (whErr) {
        console.warn('Webhook notification logged:', whErr);
      }

      // Guaranteed redirect to thank-you.html
      window.location.href = 'thank-you.html';
    } catch (error) {
      console.error('Submission error:', error);
      // Fallback redirect to thank-you.html
      window.location.href = 'thank-you.html';
    }
  });
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


