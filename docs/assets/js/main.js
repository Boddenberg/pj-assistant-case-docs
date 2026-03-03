/* ═══════════════════════════════════════════════════════════════════
   PJ Assistant — Case Técnico
   Interactions, Scroll Animations & Diagram Zoom
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Smooth-scroll for nav links ──────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Active nav link on scroll ────────────────────────────────────
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-list a');

  function updateActiveNav() {
    var scrollY = window.scrollY + 120;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ── Intersection Observer: fade-in on scroll ────────────────────
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll(
    '.card, .criteria-block, .stat-item, .repo-card, .arch-diagram, .ai-hero-card, .ai-feature'
  ).forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    observer.observe(el);
  });

  var style = document.createElement('style');
  style.textContent = '.fade-in { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

  // ── Header shadow on scroll ──────────────────────────────────────
  var header = document.querySelector('.site-header');
  window.addEventListener('scroll', function () {
    header.style.boxShadow = window.scrollY > 40
      ? '0 1px 16px rgba(0,0,0,0.25)'
      : 'none';
  }, { passive: true });

  // ── Diagram Zoom ─────────────────────────────────────────────────
  var zoomBtn = document.getElementById('zoom-btn');
  var zoomOverlay = document.getElementById('zoom-overlay');
  var zoomClose = document.getElementById('zoom-close');
  var zoomContent = document.getElementById('zoom-content');

  if (zoomBtn && zoomOverlay) {
    zoomBtn.addEventListener('click', function () {
      // Clone the rendered SVG into the overlay
      var svg = document.querySelector('.arch-diagram .mermaid svg');
      if (svg) {
        zoomContent.innerHTML = '';
        var clone = svg.cloneNode(true);
        clone.style.maxWidth = 'none';
        clone.style.width = 'auto';
        clone.style.minWidth = '1000px';
        zoomContent.appendChild(clone);
      }
      zoomOverlay.classList.add('active');
      zoomClose.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    function closeZoom() {
      zoomOverlay.classList.remove('active');
      zoomClose.classList.remove('active');
      document.body.style.overflow = '';
    }

    zoomClose.addEventListener('click', closeZoom);
    zoomOverlay.addEventListener('click', function (e) {
      if (e.target === zoomOverlay) closeZoom();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && zoomOverlay.classList.contains('active')) {
        closeZoom();
      }
    });
  }

})();
