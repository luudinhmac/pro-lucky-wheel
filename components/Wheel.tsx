
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioService } from '../services/audioService';

interface WheelProps {
  entries: string[];
  isSpinning: boolean;
  rotation: number;
  winningIndex: number | null;
  onSpinEnd: (index: number) => void;
  onSpinStart: () => void;
}

const Wheel: React.FC<WheelProps> = ({ entries, isSpinning, rotation, winningIndex, onSpinEnd, onSpinStart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRotationRef = useRef(rotation);
  const [needleAngle, setNeedleAngle] = useState(0); 
  const [isHoveringHub, setIsHoveringHub] = useState(false);
  const [pulse, setPulse] = useState(0);

  // Animation for neon pulse
  useEffect(() => {
    if (winningIndex === null) return;
    let frameId: number;
    const animate = (time: number) => {
      setPulse(Math.sin(time / 200) * 0.5 + 0.5);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [winningIndex]);
  
  const colors = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#eab308', // Yellow
    '#22c55e', // Green
    '#a855f7', // Purple
    '#f97316', // Orange
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#8b5cf6', // Indigo
    '#10b981'  // Emerald
  ];

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    ctx.clearRect(0, 0, width, height);

    if (entries.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
      return;
    }

    const sliceAngle = (Math.PI * 2) / entries.length;

    // --- 1. Draw Outer Frame ---
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.stroke();

    // --- 2. Draw Wheel Slices ---
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-centerX, -centerY);

    entries.forEach((entry, i) => {
      const angle = i * sliceAngle;
      const isWinner = i === winningIndex;
      
      // Slice Body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();
      
      if (isWinner) {
        // Neon Glow for Winning Slice
        ctx.shadowBlur = 15 + pulse * 15;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        // Brighter Inner Fill Overlay
        ctx.globalAlpha = 0.3 + pulse * 0.2;
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Neon Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4 + pulse * 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Pins (Đinh)
      const pinX = centerX + radius * Math.cos(angle);
      const pinY = centerY + radius * Math.sin(angle);
      
      const pinGrad = ctx.createRadialGradient(pinX-2, pinY-2, 1, pinX, pinY, 5);
      pinGrad.addColorStop(0, '#ffffff');
      pinGrad.addColorStop(0.4, '#FFD700');
      pinGrad.addColorStop(1, '#B8860B');

      ctx.beginPath();
      ctx.arc(pinX, pinY, 5, 0, Math.PI * 2);
      ctx.fillStyle = pinGrad;
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Text with truncation and shadows
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = isWinner ? 'black 17px Inter' : 'bold 15px Inter';
      
      if (isWinner) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        // Pulse text size slightly
        const scale = 1 + pulse * 0.05;
        ctx.scale(scale, scale);
      } else {
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
      }
      
      const hubRadius = 30;
      const maxTextWidth = radius - hubRadius - 40; 
      let text = entry;
      let textWidth = ctx.measureText(text).width;
      
      if (textWidth > maxTextWidth) {
        while (textWidth > maxTextWidth && text.length > 0) {
          text = text.slice(0, -1);
          textWidth = ctx.measureText(text + '...').width;
        }
        text = text + '...';
      }
      
      ctx.fillText(text, radius - 25, 5);
      ctx.restore();
    });

    ctx.restore();

    // --- 3. Draw Center Hub ---
    const hubRadius = isHoveringHub && !isSpinning ? 34 : 30;
    const hubGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, hubRadius);
    
    if (isHoveringHub && !isSpinning) {
        hubGrad.addColorStop(0, '#ffffff');
        hubGrad.addColorStop(0.5, '#f5f8ff');
        hubGrad.addColorStop(1, '#6366f1'); 
    } else {
        hubGrad.addColorStop(0, '#ffffff');
        hubGrad.addColorStop(0.7, '#e2e8f0');
        hubGrad.addColorStop(1, '#94a3b8');
    }
    
    ctx.save();
    if (isHoveringHub && !isSpinning) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = isHoveringHub && !isSpinning ? '#4f46e5' : '#475569';
    ctx.lineWidth = isHoveringHub && !isSpinning ? 4 : 3;
    ctx.stroke();
    
    ctx.fillStyle = isHoveringHub && !isSpinning ? '#4f46e5' : '#0f172a';
    ctx.font = `bold ${isHoveringHub && !isSpinning ? '14px' : '12px'} Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUAY', centerX, centerY);
    ctx.restore();

    // --- 4. Draw Needle (Kim) ---
    const needlePivotX = centerX + radius + 40; 
    const needlePivotY = centerY;
    const needleTipLength = 40; 

    ctx.save();
    ctx.translate(needlePivotX, needlePivotY);
    ctx.rotate(needleAngle * Math.PI / 180);
    
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowOffsetY = 4;

    const drawBladePart = (isTop: boolean) => {
      ctx.beginPath();
      ctx.moveTo(-needleTipLength, 0); 
      ctx.bezierCurveTo(-(needleTipLength * 0.6), isTop ? -20 : 20, -(needleTipLength * 0.2), isTop ? -24 : 24, 0, isTop ? -16 : 16); 
      ctx.lineTo(18, 0); 
      ctx.closePath();
      
      const bladeGrad = ctx.createLinearGradient(-needleTipLength, 0, 18, 0);
      if (isTop) {
        bladeGrad.addColorStop(0, '#ff4d4d');
        bladeGrad.addColorStop(0.4, '#ee0000');
        bladeGrad.addColorStop(1, '#880000');
      } else {
        bladeGrad.addColorStop(0, '#cc0000');
        bladeGrad.addColorStop(0.4, '#990000');
        bladeGrad.addColorStop(1, '#550000');
      }
      ctx.fillStyle = bladeGrad;
      ctx.fill();
    };

    drawBladePart(true);
    drawBladePart(false);

    ctx.beginPath();
    ctx.moveTo(-needleTipLength, 0);
    ctx.lineTo(18, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-needleTipLength, 0);
    ctx.bezierCurveTo(-(needleTipLength * 0.6), -20, -(needleTipLength * 0.2), -24, 0, -16);
    ctx.lineTo(18, 0);
    ctx.lineTo(0, 16);
    ctx.bezierCurveTo(-(needleTipLength * 0.2), 24, -(needleTipLength * 0.6), 20, -needleTipLength, 0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    const capGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
    capGrad.addColorStop(0, '#cbd5e1');
    capGrad.addColorStop(1, '#1e293b');
    
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = capGrad;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

  }, [entries, rotation, needleAngle, isHoveringHub, isSpinning, winningIndex, pulse]);

  useEffect(() => {
    drawWheel();
    
    if (entries.length > 0) {
      const sliceSize = 360 / entries.length;
      const prevPos = Math.floor(prevRotationRef.current / sliceSize);
      const currPos = Math.floor(rotation / sliceSize);
      
      if (currPos !== prevPos) {
        audioService.playTick();
        setNeedleAngle(24); 
        setTimeout(() => setNeedleAngle(0), 40);
      }
    }
    prevRotationRef.current = rotation;
  }, [drawWheel, rotation, entries.length]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
        clientX = (e as React.TouchEvent).touches[0].clientX;
        clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSpinning) {
        if (isHoveringHub) setIsHoveringHub(false);
        return;
    }
    const { x, y } = getCanvasCoords(e);
    const centerX = canvasRef.current!.width / 2;
    const centerY = canvasRef.current!.height / 2;
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    const hovering = dist <= 45;
    if (hovering !== isHoveringHub) {
        setIsHoveringHub(hovering);
    }
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSpinning) return;
    const { x, y } = getCanvasCoords(e);
    const centerX = canvasRef.current!.width / 2;
    const centerY = canvasRef.current!.height / 2;
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    if (dist <= 45) {
        onSpinStart();
    }
  };

  return (
    <div className="relative flex justify-center items-center select-none">
      <div className="absolute w-[470px] h-[470px] border-2 border-dashed border-indigo-100 rounded-full animate-[spin_120s_linear_infinite] pointer-events-none opacity-50"></div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        onClick={handleClick}
        onTouchStart={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHoveringHub(false)}
        style={{ cursor: isHoveringHub && !isSpinning ? 'pointer' : 'default' }}
        className={`relative z-10 transition-transform duration-300 ${isSpinning ? 'scale-105' : ''}`}
      />
    </div>
  );
};

export default Wheel;
