"use client";

import { useEffect, useRef, useCallback } from "react";

// Rising particles with trails - creates a sense of depth and upward movement
const WaveParticlesRising: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
    trail: Array<{ x: number; y: number; opacity: number }>;
  }>>([]);

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = 40;
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height, // Start at random heights
        speed: Math.random() * 0.8 + 0.3, // Rising speed
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.3,
        trail: [],
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        initParticles(canvas.width, canvas.height);
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Fade out previous frame slightly for trail effect
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;

      particles.forEach((particle) => {
        // Update position - particles rise
        particle.y -= particle.speed;
        
        // Add slight horizontal drift
        particle.x += Math.sin(particle.y * 0.01) * 0.3;

        // Add current position to trail
        particle.trail.push({
          x: particle.x,
          y: particle.y,
          opacity: particle.opacity,
        });

        // Limit trail length
        if (particle.trail.length > 15) {
          particle.trail.shift();
        }

        // Reset particle when it goes off top
        if (particle.y < -particle.size) {
          particle.y = canvas.height + particle.size;
          particle.x = Math.random() * canvas.width;
          particle.trail = [];
        }

        // Wrap horizontally
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;

        // Draw trail
        particle.trail.forEach((point, index) => {
          const trailOpacity = (point.opacity * (index / particle.trail.length)) * 0.4;
          ctx.beginPath();
          ctx.arc(point.x, point.y, particle.size * (index / particle.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${trailOpacity})`;
          ctx.fill();
        });

        // Draw main particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, `rgba(59, 130, 246, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(96, 165, 250, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default WaveParticlesRising;

