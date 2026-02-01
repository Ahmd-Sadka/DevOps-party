// Confetti effect hook for celebrations
import { useCallback } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6',
  '#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6',
];

export function useConfetti() {
  const createConfetti = useCallback((type: 'burst' | 'rain' | 'sides' = 'burst', duration: number = 3000) => {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = [];
    const particleCount = type === 'rain' ? 100 : type === 'sides' ? 60 : 80;

    // Create particles based on type
    for (let i = 0; i < particleCount; i++) {
      let x, y, vx, vy;

      switch (type) {
        case 'burst':
          x = canvas.width / 2;
          y = canvas.height / 2;
          const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
          const velocity = 8 + Math.random() * 8;
          vx = Math.cos(angle) * velocity;
          vy = Math.sin(angle) * velocity - 5;
          break;

        case 'rain':
          x = Math.random() * canvas.width;
          y = -20 - Math.random() * 100;
          vx = (Math.random() - 0.5) * 2;
          vy = 3 + Math.random() * 3;
          break;

        case 'sides':
          const fromLeft = i % 2 === 0;
          x = fromLeft ? -10 : canvas.width + 10;
          y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
          vx = (fromLeft ? 1 : -1) * (5 + Math.random() * 5);
          vy = -3 - Math.random() * 5;
          break;

        default:
          x = canvas.width / 2;
          y = canvas.height / 2;
          vx = (Math.random() - 0.5) * 10;
          vy = -5 - Math.random() * 10;
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    const gravity = 0.15;
    const friction = 0.99;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.vy += gravity;
        p.vx *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    setTimeout(() => {
      cancelAnimationFrame(animationId);
      canvas.remove();
    }, duration);
  }, []);

  const burstConfetti = useCallback(() => createConfetti('burst'), [createConfetti]);
  const rainConfetti = useCallback(() => createConfetti('rain', 4000), [createConfetti]);
  const sidesConfetti = useCallback(() => createConfetti('sides'), [createConfetti]);

  return { burstConfetti, rainConfetti, sidesConfetti, createConfetti };
}
