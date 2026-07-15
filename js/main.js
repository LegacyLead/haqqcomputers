/* HaQQ Computers & Technology — shared behavior */

// ---- Preloader ----
const preloader = document.getElementById('preloader');
if(preloader){
  const hidePreloader = () => preloader.classList.add('loaded');
  window.addEventListener('load', () => setTimeout(hidePreloader, 350));
  // Safety net: never let it hang forever if load event is delayed
  setTimeout(hidePreloader, 3000);
}

// ---- Nav scroll state + mobile toggle ----
const nav = document.querySelector('.site-nav');
const burger = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

function onScroll(){
  if(window.scrollY > 40){ nav.classList.add('scrolled'); }
  else { nav.classList.remove('scrolled'); }
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

if(burger){
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navOverlay.classList.toggle('show');
    burger.classList.toggle('active');
  });
  navOverlay.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('show');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('show');
  }));
}

// ---- Scroll reveal (IntersectionObserver) ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold:.14, rootMargin:'0px 0px -60px 0px' });
revealEls.forEach(el => io.observe(el));

// ---- 3D tilt on product cards & pillars (pointer + touch) ----
const tiltEls = document.querySelectorAll('.product-card, .pillar, .track-card, .plan-card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!prefersReducedMotion){
  tiltEls.forEach(el => {
    el.classList.add('tilt-card');
    const maxTilt = 7;
    function handleMove(x, y, rect){
      const px = (x - rect.left) / rect.width - 0.5;
      const py = (y - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg) translateY(-4px)`;
    }
    el.addEventListener('pointermove', (e) => {
      if(e.pointerType === 'mouse'){ handleMove(e.clientX, e.clientY, el.getBoundingClientRect()); }
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    // Light touch feedback: a single subtle tilt pulse on tap, then reset
    el.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY, el.getBoundingClientRect());
      setTimeout(() => { el.style.transform = ''; }, 380);
    }, { passive:true });
  });
}

// ---- Subtle hero parallax on scroll (throttled) ----
const heroMain = document.querySelector('.hero-main');
const heroSide = document.querySelector('.hero-side');
if(heroMain && !prefersReducedMotion){
  let ticking = false;
  window.addEventListener('scroll', () => {
    if(!ticking){
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if(y < window.innerHeight){
          heroMain.style.transform = `translateY(${y * 0.18}px)`;
          if(heroSide) heroSide.style.transform = `translateY(${y * 0.1}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive:true });
}
// ---- Graceful fallback for any image that fails to load ----
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    const parent = img.closest('.product-media, .portfolio-item, .visual, .service-detail .visual');
    if(parent){ parent.style.background = 'linear-gradient(135deg, #eef2f7, #dde6ee)'; }
  }, { once:true });
});

document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

// ---- WhatsApp CTA helper ----
// Central number so it's edited once. Replace with live business number.
const HAQQ_WHATSAPP = '2347076163345';
document.querySelectorAll('[data-wa]').forEach(el => {
  const msg = el.getAttribute('data-wa') || "Hi HaQQ, I'd like to talk about a project.";
  el.href = `https://wa.me/${HAQQ_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  el.target = '_blank';
  el.rel = 'noopener';
});

// ---- Generic accordion (FAQ) ----
document.querySelectorAll('.accordion').forEach(acc => {
  acc.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      acc.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });
});

// ---- Generic tabs ----
document.querySelectorAll('.tabs').forEach(tabGroup => {
  const buttons = tabGroup.querySelectorAll('.tab-btn');
  const panels = tabGroup.querySelectorAll('.tab-panel');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      tabGroup.querySelector(`.tab-panel[data-tab="${btn.dataset.tab}"]`).classList.add('active');
    });
  });
});

// ---- Testimonial carousel ----
document.querySelectorAll('.carousel').forEach(car => {
  const track = car.querySelector('.carousel-track');
  const slides = car.querySelectorAll('.carousel-slide');
  const prev = car.querySelector('.carousel-prev');
  const next = car.querySelector('.carousel-next');
  const dotsWrap = car.querySelector('.carousel-dots');
  let idx = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => go(i));
    dotsWrap && dotsWrap.appendChild(dot);
  });

  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dotsWrap && dotsWrap.querySelectorAll('.carousel-dot').forEach((d, di) => d.classList.toggle('active', di === idx));
  }
  prev && prev.addEventListener('click', () => go(idx - 1));
  next && next.addEventListener('click', () => go(idx + 1));

  let auto = setInterval(() => go(idx + 1), 5500);
  car.addEventListener('mouseenter', () => clearInterval(auto));
  car.addEventListener('mouseleave', () => auto = setInterval(() => go(idx + 1), 5500));
});

// ---- Shop filters + pagination (only present on shop.html) ----
const filterButtons = document.querySelectorAll('.filter-chip');
const shopGrid = document.querySelector('.shop-grid');
const paginationWrap = document.querySelector('.shop-pagination');
const productCountEl = document.querySelector('.product-count');

if(filterButtons.length && shopGrid){
  const allItems = [...shopGrid.querySelectorAll('.product-card')];
  const PER_PAGE = 12;
  let currentFilter = 'all';
  let currentPage = 1;

  function getFiltered(){
    return currentFilter === 'all' ? allItems : allItems.filter(item => item.dataset.category === currentFilter);
  }

  function renderPage(){
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if(currentPage > totalPages) currentPage = totalPages;

    // Hide everything, then show only the current page's slice of the filtered set
    allItems.forEach(item => item.style.display = 'none');
    const start = (currentPage - 1) * PER_PAGE;
    filtered.slice(start, start + PER_PAGE).forEach(item => item.style.display = '');

    if(productCountEl){
      productCountEl.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'} shown`;
    }

    if(paginationWrap){
      paginationWrap.innerHTML = '';
      if(totalPages > 1){
        const mkBtn = (label, page, opts = {}) => {
          const b = document.createElement('button');
          b.className = 'page-btn' + (opts.active ? ' active' : '') + (opts.disabled ? ' disabled' : '');
          b.textContent = label;
          b.disabled = !!opts.disabled;
          b.addEventListener('click', () => { currentPage = page; renderPage(); scrollToGridTop(); });
          return b;
        };
        paginationWrap.appendChild(mkBtn('‹ Prev', currentPage - 1, { disabled: currentPage === 1 }));
        for(let i = 1; i <= totalPages; i++){
          paginationWrap.appendChild(mkBtn(String(i), i, { active: i === currentPage }));
        }
        paginationWrap.appendChild(mkBtn('Next ›', currentPage + 1, { disabled: currentPage === totalPages }));
      }
    }
  }

  function scrollToGridTop(){
    const toolbar = document.querySelector('.shop-toolbar');
    if(toolbar) toolbar.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  filterButtons.forEach(chip => {
    chip.addEventListener('click', () => {
      filterButtons.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      currentPage = 1;
      renderPage();
    });
  });

  renderPage();
}

// ---- Contact form (front-end validation + mailto fallback) ----
// UPGRADE PATH: for guaranteed delivery without relying on the visitor's email
// client, sign up free at https://formspree.io, create a form, and replace
// this handler's mailto logic with a fetch() POST to your Formspree endpoint.
// Formspree's free tier needs no backend and takes about 2 minutes to set up.
const contactForm = document.querySelector('.contact-form');
if(contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = contactForm.querySelector('.form-status');
    const name = contactForm.querySelector('[name="name"]').value.trim();
    const email = contactForm.querySelector('[name="email"]').value.trim();
    const phone = contactForm.querySelector('[name="phone"]').value.trim();
    const pillar = contactForm.querySelector('[name="pillar"]').value;
    const message = contactForm.querySelector('[name="message"]').value.trim();
    const consent = contactForm.querySelector('[name="consent"]');
    if(!name || !email || !message){
      status.textContent = 'Please fill in every field before sending.';
      status.style.color = '#c0392b';
      return;
    }
    if(consent && !consent.checked){
      status.textContent = 'Please confirm you agree to be contacted about this enquiry.';
      status.style.color = '#c0392b';
      return;
    }
    const subject = `New enquiry — ${pillar}`;
    const body =
`Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Interested in: ${pillar}

Message:
${message}`;
    const mailtoLink = `mailto:haqqcomputers@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    status.textContent = `Opening your email app to send this to HaQQ, ${name.split(' ')[0]} — if nothing opens, email haqqcomputers@gmail.com directly or use WhatsApp below.`;
    status.style.color = '#1fae57';
  });
}
