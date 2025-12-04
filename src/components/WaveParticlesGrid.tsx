"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WaveParticlesGridProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

// Interactive geometric grid that responds to mouse movement
// Tracks mouse position even when hovering over content on top
const WaveParticlesGrid: React.FC<WaveParticlesGridProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsHovering(true);
  }, [containerRef]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 50;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      
      // Draw grid lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        let offset = 0;
        if (isHovering && mouseX >= 0 && mouseY >= 0) {
          const distance = Math.abs(x - mouseX);
          const maxDistance = 200;
          if (distance < maxDistance) {
            // Create wave effect based on distance from mouse
            offset = Math.sin((x - mouseX) * 0.05) * (1 - distance / maxDistance) * 15;
          }
        }
        
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        let offset = 0;
        if (isHovering && mouseX >= 0 && mouseY >= 0) {
          const distance = Math.abs(y - mouseY);
          const maxDistance = 200;
          if (distance < maxDistance) {
            // Create wave effect based on distance from mouse
            offset = Math.sin((y - mouseY) * 0.05) * (1 - distance / maxDistance) * 15;
          }
        }
        
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Draw interactive glow at intersection points near mouse
      if (isHovering && mouseX >= 0 && mouseY >= 0) {
        const glowRadius = 150;
        const distance = Math.sqrt(
          Math.pow(Math.floor(mouseX / gridSize) * gridSize - mouseX, 2) +
          Math.pow(Math.floor(mouseY / gridSize) * gridSize - mouseY, 2)
        );

        // Find nearby grid intersections
        const startX = Math.floor((mouseX - glowRadius) / gridSize) * gridSize;
        const startY = Math.floor((mouseY - glowRadius) / gridSize) * gridSize;
        const endX = Math.ceil((mouseX + glowRadius) / gridSize) * gridSize;
        const endY = Math.ceil((mouseY + glowRadius) / gridSize) * gridSize;

        for (let x = startX; x <= endX; x += gridSize) {
          for (let y = startY; y <= endY; y += gridSize) {
            const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
            if (dist < glowRadius) {
              const intensity = 1 - dist / glowRadius;
              const gradient = ctx.createRadialGradient(x, y, 0, x, y, gridSize * 0.7);
              gradient.addColorStop(0, `rgba(59, 130, 246, ${intensity * 0.4})`);
              gradient.addColorStop(0.5, `rgba(96, 165, 250, ${intensity * 0.2})`);
              gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
              
              ctx.fillStyle = gradient;
              ctx.fillRect(x - gridSize * 0.35, y - gridSize * 0.35, gridSize * 0.7, gridSize * 0.7);
            }
          }
        }

        // Draw central glow at mouse position
        const centerGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
        centerGradient.addColorStop(0, "rgba(59, 130, 246, 0.6)");
        centerGradient.addColorStop(0.5, "rgba(96, 165, 250, 0.3)");
        centerGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    // Attach mouse listeners to the parent container so it works even when hovering over content
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [handleMouseMove, handleMouseLeave, isHovering, containerRef]);

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
        pointerEvents: "none", // Allow clicks to pass through
      }}
    />
  );
};

export default WaveParticlesGrid;
