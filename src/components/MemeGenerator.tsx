import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Download, RotateCcw, Plus, Minus, Move } from 'lucide-react';
import memeBase from '@/assets/bigtrout-meme-base.jpg';

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  label: string;
}

const STICKER_OPTIONS = [
  // Accessories
  { emoji: '🕶️', label: 'Shades' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🎩', label: 'Top Hat' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '🧢', label: 'Cap' },
  { emoji: '🎓', label: 'Grad Cap' },
  { emoji: '🪖', label: 'Helmet' },
  // Bling & Money
  { emoji: '💰', label: 'Cash Bag' },
  { emoji: '💵', label: 'Dollar' },
  { emoji: '💎', label: 'Diamond' },
  { emoji: '⛓️', label: 'Chain' },
  { emoji: '💲', label: 'Dollar Sign' },
  { emoji: '🪙', label: 'Coin' },
  // Meme vibes
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '⚡', label: 'Lightning' },
  { emoji: '💪', label: 'Flex' },
  { emoji: '🐟', label: 'Fish' },
  { emoji: '🎤', label: 'Mic' },
  { emoji: '🎸', label: 'Guitar' },
  { emoji: '🍺', label: 'Beer' },
  { emoji: '🏆', label: 'Trophy' },
  { emoji: '💯', label: '100' },
];

const MemeGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 500, h: 500 });

  // Load base image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImage(img);
      // Keep aspect ratio, max 500px
      const max = 500;
      const ratio = img.width / img.height;
      if (ratio > 1) {
        setCanvasSize({ w: max, h: Math.round(max / ratio) });
      } else {
        setCanvasSize({ w: Math.round(max * ratio), h: max });
      }
    };
    img.src = memeBase;
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Draw stickers
    stickers.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    });

    // Draw text
    const drawMemeText = (text: string, y: number) => {
      if (!text) return;
      const fontSize = Math.max(20, canvas.width * 0.08);
      ctx.font = `900 ${fontSize}px \"Impact\", \"Arial Black\", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = fontSize * 0.12;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'white';
      ctx.lineJoin = 'round';
      ctx.strokeText(text.toUpperCase(), canvas.width / 2, y);
      ctx.fillText(text.toUpperCase(), canvas.width / 2, y);
    };

    drawMemeText(topText, canvasSize.h * 0.1);
    drawMemeText(bottomText, canvasSize.h * 0.92);
  }, [baseImage, stickers, topText, bottomText, canvasSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const addSticker = (emoji: string, label: string) => {
    const newSticker: Sticker = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: canvasSize.w / 2,
      y: canvasSize.h / 2,
      size: 48,
      rotation: 0,
      label,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedSticker(newSticker.id);
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedSticker === id) setSelectedSticker(null);
  };

  // Get pointer position relative to canvas
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    // Find sticker under pointer (reverse order = top first)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const dist = Math.sqrt((pos.x - s.x) ** 2 + (pos.y - s.y) ** 2);
      if (dist < s.size * 0.6) {
        setDragging(s.id);
        setSelectedSticker(s.id);
        setDragOffset({ x: pos.x - s.x, y: pos.y - s.y });
        return;
      }
    }
    setSelectedSticker(null);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getPos(e);
    updateSticker(dragging, { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y });
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Draw final high-res version
    const link = document.createElement('a');
    link.download = 'bigtrout-meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    setStickers([]);
    setTopText('');
    setBottomText('');
    setSelectedSticker(null);
  };

  const selected = stickers.find((s) => s.id === selectedSticker);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Text inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="Top text..."
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pepe/50"
          maxLength={40}
        />
        <input
          type="text"
          placeholder="Bottom text..."
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pepe/50"
          maxLength={40}
        />
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative mx-auto rounded-xl overflow-hidden border-2 border-white/10 mb-4"
        style={{ maxWidth: canvasSize.w, touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="w-full h-auto cursor-grab active:cursor-grabbing"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        {dragging && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Move className="w-3 h-3" /> Dragging...
          </div>
        )}
      </div>

      {/* Selected sticker controls */}
      {selected && (
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {selected.emoji} {selected.label}
          </span>
          <button
            onClick={() => updateSticker(selected.id, { size: Math.max(20, selected.size - 8) })}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            title="Smaller"
          >
            <Minus className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-xs text-muted-foreground w-8 text-center">{selected.size}px</span>
          <button
            onClick={() => updateSticker(selected.id, { size: Math.min(120, selected.size + 8) })}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            title="Bigger"
          >
            <Plus className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => updateSticker(selected.id, { rotation: selected.rotation - 15 })}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            title="Rotate left"
          >
            <RotateCcw className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => updateSticker(selected.id, { rotation: selected.rotation + 15 })}
            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            title="Rotate right"
          >
            <RotateCcw className="w-4 h-4 text-foreground scale-x-[-1]" />
          </button>
          <button
            onClick={() => removeSticker(selected.id)}
            className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400 text-xs px-3"
          >
            Remove
          </button>
        </div>
      )}

      {/* Sticker palette */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2 text-center">Tap to add stickers — then drag them on the image</p>
        <div className="flex flex-wrap justify-center gap-2">
          {STICKER_OPTIONS.map((opt) => (
            <button
              key={opt.emoji}
              onClick={() => addSticker(opt.emoji, opt.label)}
              className="w-11 h-11 rounded-lg border border-white/10 bg-white/5 hover:bg-pepe/10 hover:border-pepe/30 transition-all text-xl flex items-center justify-center"
              title={opt.label}
            >
              {opt.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button
          onClick={handleDownload}
          className="btn-fire flex items-center gap-2 px-6 py-2.5 text-sm"
        >
          <Download className="w-4 h-4" /> Download Meme
        </button>
      </div>
    </div>
  );
};

export default MemeGenerator;
