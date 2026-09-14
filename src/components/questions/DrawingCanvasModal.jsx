import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Trash2, Check, X, Palette } from 'lucide-react';
import Modal from '../common/Modal';

export default function DrawingCanvasModal({ isOpen, onClose, onSave, initialDrawing = null }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#0df2c9'); // Default mint
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [isEraser, setIsEraser] = useState(false);

  const colors = [
    { label: 'Mint', value: '#0df2c9' },
    { label: 'Cyan', value: '#38bdf8' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Amber', value: '#fbbf24' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'White', value: '#ffffff' }
  ];

  // Initialize canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set resolution based on element size
      canvas.width = 600;
      canvas.height = 360;

      // Dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (initialDrawing) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveToHistory();
        };
        img.src = initialDrawing;
      } else {
        saveToHistory();
      }
    }
  }, [isOpen, initialDrawing]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#090d16' : color;
    ctx.lineWidth = isEraser ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const canvas = canvasRef.current;
    if (!canvas || !previousState) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Draw Scientific Figure & Diagram"
      subtitle="Freehand diagram sketcher for physics models, chemical bonds, geometry & graphs"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Canvas Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111927] border border-[#22334d] rounded-2xl">
          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#0df2c9]" />
              Color:
            </span>
            <div className="flex items-center gap-1.5">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setColor(c.value);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    !isEraser && color === c.value ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width Selector & Tools */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Size:</span>
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setStrokeWidth(w)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  strokeWidth === w
                    ? 'bg-[#0df2c9]/20 border-[#0df2c9] text-[#0df2c9]'
                    : 'bg-[#0b101b] border-[#22334d] text-slate-400 hover:text-white'
                }`}
              >
                {w}px
              </button>
            ))}

            <div className="h-4 w-[1px] bg-[#22334d] mx-1" />

            {/* Eraser Button */}
            <button
              type="button"
              onClick={() => setIsEraser(!isEraser)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isEraser
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-[#0b101b] border-[#22334d] text-slate-400 hover:text-white'
              }`}
            >
              Eraser
            </button>

            {/* Undo & Clear */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-lg bg-[#0b101b] border border-[#22334d] text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
              title="Undo last stroke"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-[#0b101b] border border-[#22334d] text-slate-400 hover:text-rose-400 hover:border-rose-400/50 cursor-pointer"
              title="Clear canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* HTML5 Canvas Surface */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#22334d] bg-[#090d16] shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-h-[360px] aspect-[5/3] cursor-crosshair touch-none"
          />

          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-600 pointer-events-none select-none">
            600 x 360 px Canvas
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#22334d] bg-[#111927] hover:bg-[#1a233a] text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Save & Attach Figure
          </button>
        </div>
      </div>
    </Modal>
  );
}
