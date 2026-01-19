
import React, { useRef, useEffect, useState } from 'react';
import { GasState, Particle } from '../types';

interface Props {
  state: GasState;
  isPaused: boolean;
}

const PARTICLE_COUNT = 80;

const GasSimulation: React.FC<Props> = ({ state, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: Math.random() * (canvas.height - 20) + 10,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        radius: 3,
        color: '#60a5fa'
      });
    }
    particlesRef.current = particles;
  }, []);

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Simulation Container Bounds
    // Volume corresponds to the height of the container
    // Let's say Volume 100 L = 100 pixels, Volume 500 L = 500 pixels
    const cylinderWidth = 240;
    const containerX = (width - cylinderWidth) / 2;
    const containerBottom = height - padding;
    const pistonHeight = state.volume; // Linear mapping
    const containerTop = containerBottom - pistonHeight;

    ctx.clearRect(0, 0, width, height);

    // Draw Container Walls
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(containerX, containerTop - 40); // left wall extend up
    ctx.lineTo(containerX, containerBottom); // left wall
    ctx.lineTo(containerX + cylinderWidth, containerBottom); // bottom wall
    ctx.lineTo(containerX + cylinderWidth, containerTop - 40); // right wall extend up
    ctx.stroke();

    // Draw Piston
    ctx.fillStyle = '#475569';
    ctx.fillRect(containerX - 2, containerTop - 10, cylinderWidth + 4, 15);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(containerX - 2, containerTop - 10, cylinderWidth + 4, 15);
    
    // Piston Handle
    ctx.fillStyle = '#64748b';
    ctx.fillRect(containerX + cylinderWidth/2 - 5, containerTop - 100, 10, 90);

    // Speed multiplier based on Temperature (v ∝ sqrt(T))
    // Reference: Average kinetic energy E_k = 3/2 kT = 1/2 m v^2
    const speedFactor = Math.sqrt(state.temperature / 300) * 1.5;
    
    // Color factor based on Temperature (Blue to Red)
    const tempRatio = Math.min(Math.max((state.temperature - 100) / 500, 0), 1);
    const red = Math.floor(tempRatio * 255);
    const blue = Math.floor((1 - tempRatio) * 255);
    const particleColor = `rgb(${red}, 140, ${blue})`;

    // Update and Draw Particles
    if (!isPaused) {
      particlesRef.current.forEach(p => {
        // Move
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        // Bounce Walls
        if (p.x - p.radius < containerX) {
          p.x = containerX + p.radius;
          p.vx *= -1;
        } else if (p.x + p.radius > containerX + cylinderWidth) {
          p.x = containerX + cylinderWidth - p.radius;
          p.vx *= -1;
        }

        // Bounce Bottom
        if (p.y + p.radius > containerBottom) {
          p.y = containerBottom - p.radius;
          p.vy *= -1;
        } 
        
        // Bounce Piston (Dynamic ceiling)
        if (p.y - p.radius < containerTop + 5) {
          p.y = containerTop + 5 + p.radius;
          p.vy *= -1;
        }
      });
    }

    // Render Particles
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      // Add glow for hot particles
      if (tempRatio > 0.6) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = particleColor;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Draw Measurement Lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    for (let h = 0; h < 600; h += 50) {
      const lineY = containerBottom - h;
      if (lineY > 50) {
        ctx.beginPath();
        ctx.moveTo(containerX - 20, lineY);
        ctx.lineTo(containerX + cylinderWidth + 20, lineY);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [state, isPaused]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full cursor-default"
    />
  );
};

export default GasSimulation;
