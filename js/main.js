const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal only when motion is welcome; content stays visible without JS.
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

const nav = document.querySelector('.nav');
const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 28);
updateNav();
window.addEventListener('scroll', updateNav, { passive: true });

const toggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  const open = toggle.classList.toggle('active');
  navLinks?.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  toggle?.classList.remove('active');
  navLinks.classList.remove('open');
}));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const selector = anchor.getAttribute('href');
    if (!selector || selector === '#') return;
    const target = document.querySelector(selector);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`Project inquiry — ${data.get('type') || 'New idea'}`);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nProject type: ${data.get('type')}\n\n${data.get('message')}`
  );
  window.location.href = `mailto:hello@banshii.com?subject=${subject}&body=${body}`;
});

const waitlistForm = document.getElementById('waitlist-form');
waitlistForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!waitlistForm.reportValidity()) return;
  const data = Object.fromEntries(new FormData(waitlistForm));
  const entries = JSON.parse(localStorage.getItem('workfold-waitlist') || '[]');
  entries.push({ ...data, joinedAt: new Date().toISOString() });
  localStorage.setItem('workfold-waitlist', JSON.stringify(entries.slice(-10)));
  waitlistForm.hidden = true;
  const success = document.querySelector('.waitlist-success');
  if (success) success.hidden = false;
});

// Lightweight Three.js fields: atmospheric, pointer-reactive and progressively enhanced.
async function mountThreeScenes() {
  if (reducedMotion || !document.querySelector('.three-canvas')) return;
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
  } catch {
    return;
  }

  document.querySelectorAll('.three-canvas').forEach((canvas) => {
    const holder = canvas.parentElement;
    const sceneName = canvas.dataset.scene;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
    camera.position.z = sceneName === 'studio' ? 8 : 7;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));

    const count = sceneName === 'workfold' ? 120 : sceneName === 'studio' ? 85 : 55;
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = sceneName === 'studio' ? 4.7 + Math.random() * 2 : 2.5 + Math.random() * 3.8;
      const angle = Math.random() * Math.PI * 2;
      points[i * 3] = Math.cos(angle) * radius + (sceneName === 'studio' ? 2.4 : 0);
      points[i * 3 + 1] = (Math.random() - .5) * (sceneName === 'studio' ? 8 : 6);
      points[i * 3 + 2] = (Math.random() - .5) * 4;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const material = new THREE.PointsMaterial({
      color: sceneName === 'close' ? 0xffd8cf : sceneName === 'studio' ? 0xff684b : 0xe86749,
      size: sceneName === 'close' ? .07 : .045,
      transparent: true,
      opacity: sceneName === 'close' ? .58 : .35,
      sizeAttenuation: true,
    });
    const field = new THREE.Points(geometry, material);
    scene.add(field);

    if (sceneName !== 'studio') {
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.35, .018, 160, 12, 2, 3),
        new THREE.MeshBasicMaterial({
          color: sceneName === 'close' ? 0xffffff : 0xff7b61,
          transparent: true,
          opacity: sceneName === 'close' ? .2 : .14,
        })
      );
      knot.position.set(sceneName === 'workfold' ? 0 : 3.3, sceneName === 'workfold' ? .7 : 0, -1);
      scene.add(knot);
      field.userData.knot = knot;
    }

    const pointer = { x: 0, y: 0 };
    holder?.addEventListener('pointermove', (event) => {
      const rect = holder.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - .5) * .16;
      pointer.y = ((event.clientY - rect.top) / rect.height - .5) * .12;
    }, { passive: true });

    const resize = () => {
      const width = holder?.clientWidth || innerWidth;
      const height = holder?.clientHeight || innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    new ResizeObserver(resize).observe(holder);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      field.rotation.y += .00055;
      field.rotation.z += .00025;
      field.rotation.x += (pointer.y - field.rotation.x) * .025;
      field.rotation.y += (pointer.x - field.rotation.y * .02) * .008;
      if (field.userData.knot) {
        field.userData.knot.rotation.x += .0018;
        field.userData.knot.rotation.y += .0025;
      }
      renderer.render(scene, camera);
    };
    animate();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else animate();
    });
  });
}

mountThreeScenes();
