"use client";

import { useEffect, useRef, useCallback } from "react";

// Wave/Flow Field animation
const WaveParticlesFlow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);
  const timeRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.min(Math.floor((width * height) / 10000), 100);
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  }, []);

  // Flow field function - creates wave-like patterns
  const getFlowField = (x: number, y: number, time: number) => {
    const scale = 0.01;
    const angle = Math.sin(x * scale + time * 0.5) * Math.cos(y * scale + time * 0.3) * Math.PI * 2;
    const strength = 0.5;
    return {
      vx: Math.cos(angle) * strength,
      vy: Math.sin(angle) * strength,
    };
  };

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
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      timeRef.current += 0.016;

      particles.forEach((particle, i) => {
        // Get flow field direction at particle position
        const flow = getFlowField(particle.x, particle.y, timeRef.current);
        
        // Update velocity based on flow field
        particle.vx += (flow.vx - particle.vx) * 0.1;
        particle.vy += (flow.vy - particle.vy) * 0.1;
        
        // Limit max velocity
        const maxSpeed = 2;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();

        // Draw trail/line connecting to previous position
        if (i > 0) {
          const prevParticle = particles[i - 1];
          const dx = particle.x - prevParticle.x;
          const dy = particle.y - prevParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50) {
            ctx.beginPath();
            ctx.moveTo(prevParticle.x, prevParticle.y);
            ctx.lineTo(particle.x, particle.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${particle.opacity * 0.3 * (1 - distance / 50)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
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

export default WaveParticlesFlow;

