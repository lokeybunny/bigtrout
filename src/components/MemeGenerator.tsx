import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Download, RotateCcw, Plus, Minus, Move, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  { emoji: '🕶️', label: 'Shades' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🎩', label: 'Top Hat' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '🧢', label: 'Cap' },
  { emoji: '🎓', label: 'Grad Cap' },
  { emoji: '🪖', label: 'Helmet' },
  { emoji: '💰', label: 'Cash Bag' },
  { emoji: '💵', label: 'Dollar' },
  { emoji: '💎', label: 'Diamond' },
  { emoji: '⛓️', label: 'Chain' },
  { emoji: '💲', label: 'Dollar Sign' },
  { emoji: '🪙', label: 'Coin' },
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

const AI_PRESETS = [
  'Add gold chains and diamond sunglasses',
  'Add a crown and cash raining down',
  'Add laser eyes and fire background',
  'Add a top hat and monocle',
  'Add a backwards cap and gold teeth',
  'Add diamond hands and rockets',
];

const MemeGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 500, h: 500 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiImage, setAiImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<'sticker' | 'ai'>('sticker');

  // Load base image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImage(img);
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
    if (!canvas || !ctx) return;

    const imgToDraw = aiImage || baseImage;
    if (!imgToDraw) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);

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
      ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
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
  }, [baseImage, aiImage, stickers, topText, bottomText, canvasSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // AI generation
  const handleAiGenerate = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      // Get current base image as data URL
      const tempCanvas = document.createElement('canvas');
      const sourceImg = aiImage || baseImage;
      if (!sourceImg) throw new Error('No base image');
      tempCanvas.width = sourceImg.naturalWidth || sourceImg.width;
      tempCanvas.height = sourceImg.naturalHeight || sourceImg.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(sourceImg, 0, 0);
      const imageDataUrl = tempCanvas.toDataURL('image/jpeg', 0.85);

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meme-generator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ image: imageDataUrl, prompt }),
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      // Load the AI-generated image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setAiImage(img);
        toast.success('Meme generated! 🐟🔥');
      };
      img.onerror = () => {
        throw new Error('Failed to load generated image');
      };
      img.src = data.image;
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast.error(err.message || 'Failed to generate meme');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const handlePointerUp = () => setDragging(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    setAiImage(null);
    setAiPrompt('');
  };

  const selected = stickers.find((s) => s.id === selectedSticker);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setMode('ai')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'ai'
              ? 'bg-pepe-glow/20 border border-pepe-glow/50 text-pepe-glow'
              : 'border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Generate
        </button>
        <button
          onClick={() => setMode('sticker')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'sticker'
              ? 'bg-pepe-glow/20 border border-pepe-glow/50 text-pepe-glow'
              : 'border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          🎭 Stickers
        </button>
      </div>

      {/* AI Mode */}
      {mode === 'ai' && (
        <div className="mb-5">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 mb-4 text-sm text-yellow-200">
            ⚠️ AI generation requires Lovable AI credits. Go to <strong>Settings → Workspace → Usage</strong> to add credits. Use <strong>Sticker mode</strong> in the meantime!
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Describe what to add... e.g. gold chains and sunglasses"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate(aiPrompt)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pepe/50"
              disabled={isGenerating}
            />
            <button
              onClick={() => handleAiGenerate(aiPrompt)}
              disabled={isGenerating || !aiPrompt.trim()}
              className="btn-fire flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate</>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {AI_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setAiPrompt(preset);
                  handleAiGenerate(preset);
                }}
                disabled={isGenerating}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:bg-pepe/10 hover:border-pepe/30 hover:text-foreground transition-all disabled:opacity-40"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Canvas */}
      <div
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
        {isGenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-pepe-glow animate-spin mx-auto mb-2" />
              <p className="text-foreground text-sm font-bold">AI is cooking your meme...</p>
            </div>
          </div>
        )}
        {dragging && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Move className="w-3 h-3" /> Dragging...
          </div>
        )}
      </div>

      {/* Sticker controls */}
      {mode === 'sticker' && (
        <>
          {selected && (
            <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {selected.emoji} {selected.label}
              </span>
              <button
                onClick={() => updateSticker(selected.id, { size: Math.max(20, selected.size - 8) })}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Minus className="w-4 h-4 text-foreground" />
              </button>
              <span className="text-xs text-muted-foreground w-8 text-center">{selected.size}px</span>
              <button
                onClick={() => updateSticker(selected.id, { size: Math.min(120, selected.size + 8) })}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => updateSticker(selected.id, { rotation: selected.rotation - 15 })}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => updateSticker(selected.id, { rotation: selected.rotation + 15 })}
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-foreground scale-x-[-1]" />
              </button>
              <button
                onClick={() => removeSticker(selected.id)}
                className="p-2 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive text-xs px-3"
              >
                Remove
              </button>
            </div>
          )}
          <div className="mb-5">
            <p className="text-xs text-muted-foreground mb-2 text-center">
              Tap to add stickers — then drag them on the image
            </p>
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
        </>
      )}

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
