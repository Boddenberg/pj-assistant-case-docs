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

  if (zoomBtn && zoomOverlay && zoomContent) {

    // Find the Mermaid SVG (may take time to render)
    function findSvg() {
      return document.querySelector('.arch-diagram .mermaid svg')
          || document.querySelector('.arch-diagram svg');
    }

    function showZoom(svg) {
      zoomContent.innerHTML = '';
      var clone = svg.cloneNode(true);
      clone.removeAttribute('height');
      clone.style.maxWidth = 'none';
      clone.style.width = 'auto';
      clone.style.minWidth = '1200px';
      clone.style.height = 'auto';
      zoomContent.appendChild(clone);
      zoomOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeZoom() {
      zoomOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    zoomBtn.addEventListener('click', function () {
      var svg = findSvg();
      if (svg) {
        showZoom(svg);
      } else {
        // Mermaid hasn't rendered yet — retry after a delay
        var attempts = 0;
        var retryInterval = setInterval(function () {
          attempts++;
          svg = findSvg();
          if (svg) {
            clearInterval(retryInterval);
            showZoom(svg);
          } else if (attempts >= 5) {
            clearInterval(retryInterval);
          }
        }, 400);
      }
    });

    if (zoomClose) {
      zoomClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeZoom();
      });
    }

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
