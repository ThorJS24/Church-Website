'use client';

import { motion } from 'motion/react';

const COLORS = ['#A64A1B', '#5A673A', '#2F6B3A', '#9B2226', '#C9A227'];
const PARTICLE_COUNT = 24;

/**
 * A lightweight, dependency-free confetti burst — small animated pieces
 * radiating outward and falling, no canvas-confetti or similar library.
 * Meant for rare, meaningful moments (RSVP confirmed, prayer answered),
 * not sprinkled everywhere. Purely decorative, so it's aria-hidden and
 * removes itself after the animation via the parent unmounting it.
 */
export function ConfettiBurst() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 60 + Math.random() * 60;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 20,
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.1,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y + 40, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: 0.9, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
          className="absolute h-2 w-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
