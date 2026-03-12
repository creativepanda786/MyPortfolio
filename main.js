/* ============================================================
   Portfolio JS — Premium Apple-style interactions
   GSAP + Lenis smooth scroll + Canvas particles
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

// ── LENIS SMOOTH SCROLL ───────────────────────────────────
const lenis = new Lenis({
  duration: 1.6,
  easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.5,
  infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// ── SMOOTH ANCHOR SCROLLING (route all <a href="#..."> through Lenis) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, {
      offset: -52,          // clear the fixed nav (--nav-h)
      duration: 1.6,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    });
  });
});

// ── CUSTOM CURSOR ─────────────────────────────────────────
const cursor       = document.getElementById('cursor');
const cursorFollow = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followX = 0, followY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.05, ease: 'none' });
});

(function animateFollower() {
  followX += (mouseX - followX) * 0.1;
  followY += (mouseY - followY) * 0.1;
  gsap.set(cursorFollow, { x: followX, y: followY });
  requestAnimationFrame(animateFollower);
})();

document.querySelectorAll('a, button, [data-magnetic], .skill-card, .project-item, .contact-link-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorFollow.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorFollow.classList.remove('hovering'));
});

// ── MAGNETIC BUTTONS ──────────────────────────────────────
document.querySelectorAll('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) * 0.28;
    const dy = (e.clientY - rect.top  - rect.height / 2) * 0.28;
    gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── NAV: Scroll opacity ───────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── NAV: Active link on scroll ────────────────────────────
const navLinks = document.querySelectorAll('.nav-links a');
const sections  = document.querySelectorAll('section[id]');

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObs.observe(s));

// ── NAV: Hamburger ────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open  = mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  hamburger.setAttribute('aria-expanded', open);
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
    hamburger.setAttribute('aria-expanded', false);
  });
});

// ── HERO PARTICLE CANVAS ──────────────────────────────────
const canvas = document.getElementById('heroCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.r     = Math.random() * 1.8 + 0.4;
    this.vx    = (Math.random() - 0.5) * 0.25;
    this.vy    = (Math.random() - 0.5) * 0.25;
    this.alpha = Math.random() * 0.35 + 0.05;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,113,227,${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,113,227,${0.06 * (1 - dist / 100)})`;
        ctx.lineWidth   = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

(function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
})();

// ── HERO ENTRANCE (GSAP) ──────────────────────────────────
// Explicitly set hero elements invisible BEFORE animating —
// this is the only source of truth (no CSS data-reveal conflict)
const heroEls = {
  eyebrow:    document.querySelector('.hero-eyebrow'),
  lines:      document.querySelectorAll('.hero-line'),
  sub:        document.querySelector('.hero-sub'),
  actions:    document.querySelector('.hero-actions'),
  stats:      document.querySelector('.hero-stats'),
  scrollHint: document.querySelector('.hero-scroll-hint'),
};

gsap.set([heroEls.eyebrow, heroEls.lines, heroEls.sub, heroEls.actions, heroEls.stats, heroEls.scrollHint],
  { opacity: 0, y: 30 });

const heroTl = gsap.timeline({
  defaults: { ease: 'power3.out' },
  delay: 0.1,
  onComplete: () => {
    // Kick off counters once stats are fully visible
    document.querySelectorAll('[data-count]').forEach(animateCounter);
  }
});

heroTl
  .to(heroEls.eyebrow,    { opacity: 1, y: 0, duration: 0.7 })
  .to(heroEls.lines,      { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, '-=0.3')
  .to(heroEls.sub,        { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
  .to(heroEls.actions,    { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  .to(heroEls.stats,      { opacity: 1, y: 0, duration: 0.6 }, '-=0.35')
  .to(heroEls.scrollHint, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

// ── COUNTER ANIMATION ─────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const dur    = 1600;
  const start  = performance.now();
  (function step(now) {
    const p      = Math.min((now - start) / dur, 1);
    const eased  = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = Math.floor(eased * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(start);
}

// ── SCROLL REVEAL (data-reveal) ───────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseFloat(entry.target.dataset.delay || 0);
    setTimeout(() => entry.target.classList.add('revealed'), delay * 1000);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// ── SKILL CARD SPOTLIGHT ──────────────────────────────────
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width  * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - rect.top)  / rect.height * 100) + '%');
  });
});

// ── PROJECT ITEM HOVER ────────────────────────────────────
document.querySelectorAll('.project-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    gsap.to(item, { paddingLeft: 6, duration: 0.3, ease: 'power2.out' });
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(item, { paddingLeft: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
  });
});

// ── TIMELINE REVEAL (GSAP ScrollTrigger) ─────────────────
// Use IntersectionObserver instead of ScrollTrigger so Lenis doesn't interfere
const tlObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    gsap.to(entry.target, {
      opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
      delay: 0.05 * parseInt(entry.target.dataset.tlIndex || 0),
    });
    tlObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

gsap.utils.toArray('.tl-item').forEach((item, i) => {
  item.dataset.tlIndex = i;
  gsap.set(item, { opacity: 0, x: -30 });
  tlObs.observe(item);
});

// ── ABOUT CARD 3D TILT ────────────────────────────────────
const aboutCard = document.querySelector('.about-card');
if (aboutCard) {
  aboutCard.addEventListener('mousemove', (e) => {
    const rect = aboutCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(aboutCard, {
      rotateY: x * 12, rotateX: -y * 10,
      transformPerspective: 800, duration: 0.4, ease: 'power2.out'
    });
  });
  aboutCard.addEventListener('mouseleave', () => {
    gsap.to(aboutCard, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  });
}

// ── MARQUEE PAUSE ON HOVER ────────────────────────────────
const marquee = document.querySelector('.marquee-inner');
if (marquee) {
  marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
  marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
}

// ── CONTACT FORM ──────────────────────────────────────────
const form       = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');
const submitBtn  = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnText       = submitBtn.querySelector('.btn-text');
    btnText.textContent = 'Sending…';
    submitBtn.disabled  = true;

    const payload = {
      name:    form.querySelector('#name').value,
      email:   form.querySelector('#email').value,
      subject: form.querySelector('#subject').value,
      message: form.querySelector('#message').value,
    };

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
    } catch (err) {
      console.log('Contact form submitted (demo):', payload);
    } finally {
      btnText.textContent = 'Send Message';
      submitBtn.disabled  = false;
      form.reset();
      successMsg.classList.add('show');
      gsap.from(successMsg, { opacity: 0, y: 10, duration: 0.4 });
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }
  });

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => gsap.to(input, { scale: 1.005, duration: 0.2 }));
    input.addEventListener('blur',  () => gsap.to(input, { scale: 1,     duration: 0.2 }));
  });
}

console.log('%cMeghana Dodda — Portfolio ✦ Built with precision', 'font-size:13px;font-weight:600;color:#0071e3');

