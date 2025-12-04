"use client";

import { useEffect, useRef } from "react";

// Matrix-style falling code effect
const WaveParticlesMatrix: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

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
      }
    };

    // Matrix characters - mix of numbers, letters, and symbols
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      if (!ctx || !canvas) return;

      // Semi-transparent black overlay for trail effect
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue-green color for text (Matrix style but with blue accent)
      ctx.fillStyle = "#3b82f6"; // Blue
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate y position
        const y = drops[i] * fontSize;
        
        // Draw character with varying opacity
        const opacity = Math.min(1, (canvas.height - y) / canvas.height);
        ctx.globalAlpha = opacity;
        
        // Bright leading character
        if (y > 0) {
          ctx.fillStyle = "#60a5fa"; // Lighter blue for leading char
          ctx.fillText(text, i * fontSize, y);
        }
        
        // Trail characters (dimmer)
        for (let j = 1; j < 20; j++) {
          const trailY = y - j * fontSize;
          if (trailY > 0) {
            const trailOpacity = opacity * (1 - j / 20) * 0.3;
            ctx.globalAlpha = trailOpacity;
            ctx.fillStyle = "#3b82f6";
            const trailChar = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(trailChar, i * fontSize, trailY);
          }
        }
        
        // Reset opacity
        ctx.globalAlpha = 1;
        
        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Move drop down
        drops[i]++;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

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

export default WaveParticlesMatrix;

