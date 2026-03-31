// ---- Scroll Reveal ----
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ---- Navbar scroll ----
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- Mobile menu ----
const toggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ---- Contact form ----
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const type = data.get('type');
    const budget = data.get('budget');
    const message = data.get('message');

    const subject = encodeURIComponent(`Project Inquiry — ${type}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject Type: ${type}\nBudget: ${budget}\n\n${message}`
    );

    window.location.href = `mailto:hello@banshii.com?subject=${subject}&body=${body}`;
  });
}

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
