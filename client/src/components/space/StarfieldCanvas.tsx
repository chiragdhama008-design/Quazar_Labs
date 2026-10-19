import React, { useEffect, useRef } from 'react';

interface StarfieldCanvasProps {
  isWarping?: boolean;
  density?: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({
  isWarping = false,
  density = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive density: fewer stars on mobile screens
    const effectiveDensity = width < 768 ? Math.min(density, 80) : density;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      targetMouseX = (e.clientX - width / 2) * 0.03;
      targetMouseY = (e.clientY - height / 2) * 0.03;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Sophisticated star palette: pure white, ice blue, faint violet, subtle starlight amber
    const colors = ['#FFFFFF', '#E2E8F0', '#BAE6FD', '#DDD6FE', '#FEF3C7'];

    // Generate stars
    const stars: Star[] = Array.from({ length: effectiveDensity }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 1000 + 1,
      size: Math.random() * 1.2 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Soft celestial atmospheric clouds (very subtle, low opacity)
    const nebulae = [
      { x: width * 0.15, y: height * 0.25, radius: 450, color: 'rgba(124, 58, 237, 0.035)' },
      { x: width * 0.85, y: height * 0.65, radius: 550, color: 'rgba(6, 182, 212, 0.035)' },
    ];

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.fillStyle = '#070B16';
      ctx.fillRect(0, 0, width, height);

      // Render subtle celestial ambient glow
      nebulae.forEach(nebula => {
        const grad = ctx.createRadialGradient(
          nebula.x - mouseX * 0.3,
          nebula.y - mouseY * 0.3,
          20,
          nebula.x - mouseX * 0.3,
          nebula.y - mouseY * 0.3,
          nebula.radius
        );
        grad.addColorStop(0, nebula.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nebula.x - mouseX * 0.3, nebula.y - mouseY * 0.3, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const speed = isWarping ? 1400 * dt : (prefersReducedMotion ? 0 : 25 * dt);
      const cx = width / 2;
      const cy = height / 2;

      // Render stars
      stars.forEach(star => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 400 / star.z;
        const px = star.x * k + cx - mouseX * (1000 - star.z) * 0.0008;
        const py = star.y * k + cy - mouseY * (1000 - star.z) * 0.0008;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          star.twinklePhase += star.twinkleSpeed;
          const alpha = isWarping
            ? 0.9
            : Math.max(0.15, (1 - star.z / 1000) * (0.6 + 0.4 * Math.sin(star.twinklePhase)));

          if (isWarping) {
            const prevK = 400 / (star.z + speed * 3);
            const prevPx = star.x * prevK + cx;
            const prevPy = star.y * prevK + cy;

            ctx.strokeStyle = star.color;
            ctx.lineWidth = star.size * k * 1.2;
            ctx.beginPath();
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(px, py);
            ctx.stroke();
          } else {
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, star.size * k * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isWarping, density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
