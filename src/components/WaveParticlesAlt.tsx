"use client";

import { useEffect, useRef, useCallback } from "react";

// Alternative: Floating gradient orbs with glow effect
const WaveParticlesAlt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
    pulseSpeed: number;
    pulsePhase: number;
  }>>([]);

  const initParticles = useCallback((width: number, height: number) => {
    // Fewer, larger particles for a more premium feel
    const particleCount = Math.min(Math.floor((width * height) / 40000), 25);
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 40 + 20, // Larger orbs
        opacity: Math.random() * 0.15 + 0.05,
        hue: Math.random() * 30 + 210, // Blue range (210-240)
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

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
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      time += 0.016;

      particles.forEach((particle) => {
        // Gentle floating motion
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(time + particle.pulsePhase) * 0.2;

        // Wrap around edges smoothly
        if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
        if (particle.y > canvas.height + particle.size) particle.y = -particle.size;

        // Pulsing opacity
        const pulse = Math.sin(time * particle.pulseSpeed * 60 + particle.pulsePhase);
        let currentOpacity = particle.opacity * (0.7 + pulse * 0.3);

        // Fade out at bottom - fade starts at 70% from top, fully faded at bottom
        const fadeStart = canvas.height * 0.7;
        const fadeEnd = canvas.height;
        if (particle.y > fadeStart) {
          const fadeProgress = (particle.y - fadeStart) / (fadeEnd - fadeStart);
          currentOpacity *= (1 - fadeProgress);
        }

        // Draw gradient orb with glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 60%, ${currentOpacity * 1.5})`);
        gradient.addColorStop(0.4, `hsla(${particle.hue}, 70%, 50%, ${currentOpacity * 0.8})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
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

export default WaveParticlesAlt;

