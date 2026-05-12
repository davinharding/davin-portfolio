"use client";

import { useEffect, useRef, useCallback } from "react";

// Floating gradient orbs with glow effect.
// Performance contract:
//  - skipped entirely on small screens (< 640 CSS px)
//  - respects prefers-reduced-motion
//  - pauses via IntersectionObserver when scrolled off-screen
//  - pauses when the tab is hidden
const WaveParticlesAlt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
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
    const particleCount = Math.min(Math.floor((width * height) / 40000), 25);
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 40 + 20,
        opacity: Math.random() * 0.15 + 0.05,
        hue: Math.random() * 30 + 210,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip on tiny viewports — particles add CPU/GPU load with little visual benefit
    if (typeof window !== "undefined" && window.innerWidth < 640) return;
    // Respect reduced-motion preference
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(w, h);
    };

    const animate = () => {
      if (!ctx || !canvas || !runningRef.current) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      time += 0.016;

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(time + particle.pulsePhase) * 0.2;

        if (particle.x < -particle.size) particle.x = w + particle.size;
        if (particle.x > w + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = h + particle.size;
        if (particle.y > h + particle.size) particle.y = -particle.size;

        const pulse = Math.sin(time * particle.pulseSpeed * 60 + particle.pulsePhase);
        let currentOpacity = particle.opacity * (0.7 + pulse * 0.3);

        const fadeStart = h * 0.7;
        if (particle.y > fadeStart) {
          const fadeProgress = (particle.y - fadeStart) / (h - fadeStart);
          currentOpacity *= 1 - fadeProgress;
        }

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size
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

    const start = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      animate();
    };
    const stop = () => {
      runningRef.current = false;
      cancelAnimationFrame(animationRef.current);
    };

    resize();
    start();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start();
          else stop();
        },
        { threshold: 0 }
      );
      observer.observe(canvas);
    }

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
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
