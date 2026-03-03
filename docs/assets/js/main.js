/* ═══════════════════════════════════════════════════════════════════
   PJ Assistant — Case Técnico
   Interactions & Scroll Animations
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
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll(
    '.card, .criteria-block, .stat-item, .repo-card, .arch-diagram'
  ).forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Override fade-in for observed elements
  var style = document.createElement('style');
  style.textContent =
    '.fade-in { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

  // ── Header shrink on scroll ──────────────────────────────────────
  var header = document.querySelector('.site-header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
    } else {
      header.style.boxShadow = 'none';
    }
  }, { passive: true });

})();
