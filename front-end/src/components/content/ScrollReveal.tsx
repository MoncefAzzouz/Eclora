'use client';

import { useEffect, useRef } from 'react';

export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const items = node.querySelectorAll<HTMLElement>('[data-reveal]');
    // Only hide content below the first viewport; the hero is visible immediately.
    items.forEach((item) => {
      if (item.getBoundingClientRect().top >= window.innerHeight) item.classList.add('reveal-pending');
    });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="editorial-page">{children}</div>;
}
