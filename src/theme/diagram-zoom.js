// Diagram zoom — click to expand/collapse Mermaid diagrams
if (typeof window !== 'undefined') {
  const init = () => {
    document.addEventListener('click', (e) => {
      const zoom = e.target.closest('.diagram-zoom');
      if (!zoom) return;

      // If already expanded, collapse
      if (zoom.classList.contains('expanded')) {
        zoom.classList.remove('expanded');
        document.body.style.overflow = '';
        return;
      }

      // Expand
      zoom.classList.add('expanded');
      document.body.style.overflow = 'hidden';
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const expanded = document.querySelector('.diagram-zoom.expanded');
        if (expanded) {
          expanded.classList.remove('expanded');
          document.body.style.overflow = '';
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
