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
  density = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.05;
      targetMouseY = (e.clientY - height / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Colors: pure white, cosmic cyan, electric violet, stellar amber
    const colors = ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#C4B5FD', '#DDD6FE'];

    // Generate stars
    const stars: Star[] = Array.from({ length: density }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 1000 + 1,
      size: Math.random() * 1.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Floating nebulae dust clouds
    const nebulae = [
      { x: width * 0.2, y: height * 0.3, radius: 350, color: 'rgba(139, 92, 246, 0.04)' },
      { x: width * 0.8, y: height * 0.7, radius: 450, color: 'rgba(34, 211, 238, 0.04)' },
      { x: width * 0.5, y: height * 0.9, radius: 400, color: 'rgba(244, 63, 94, 0.03)' },
    ];

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, width, height);

      // Render ambient nebulae
      nebulae.forEach(nebula => {
        const grad = ctx.createRadialGradient(
          nebula.x - mouseX * 0.5,
          nebula.y - mouseY * 0.5,
          10,
          nebula.x - mouseX * 0.5,
          nebula.y - mouseY * 0.5,
          nebula.radius
        );
        grad.addColorStop(0, nebula.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nebula.x - mouseX * 0.5, nebula.y - mouseY * 0.5, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const speed = isWarping ? 1800 * dt : 40 * dt;
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
        const px = star.x * k + cx - mouseX * (1000 - star.z) * 0.001;
        const py = star.y * k + cy - mouseY * (1000 - star.z) * 0.001;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          star.twinklePhase += star.twinkleSpeed;
          const alpha = isWarping
            ? 1
            : Math.max(0.2, (1 - star.z / 1000) * (0.6 + 0.4 * Math.sin(star.twinklePhase)));

          if (isWarping) {
            // Warp streak
            const prevK = 400 / (star.z + speed * 4);
            const prevPx = star.x * prevK + cx;
            const prevPy = star.y * prevK + cy;

            ctx.strokeStyle = star.color;
            ctx.lineWidth = star.size * k * 1.5;
            ctx.beginPath();
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(px, py);
            ctx.stroke();
          } else {
            // Point star
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, star.size * k * 0.8, 0, Math.PI * 2);
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
