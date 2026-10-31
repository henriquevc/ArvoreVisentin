import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Upload, Link as LinkIcon, Move } from 'lucide-react';

export default function PhotoCropModal({ isOpen, initialImage, onSave, onClose }) {
  const [imageSrc, setImageSrc] = useState(initialImage || null);
  const [urlInput, setUrlInput] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);
  const containerRef = useRef(null);

  // Sync initial image when modal opens
  useEffect(() => {
    if (isOpen) {
      setImageSrc(initialImage || null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setImageLoaded(false);
    }
  }, [isOpen, initialImage]);

  // Load image object whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      // center pan
      setPan({ x: 0, y: 0 });
      setZoom(1);
    };
    img.onerror = () => {
      alert('Não foi possível carregar a imagem. Verifique se o link é válido ou envie um arquivo do computador.');
      setImageLoaded(false);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle file upload from PC
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL import
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setImageSrc(urlInput.trim());
    setUrlInput('');
  };

  // Pan dragging
  const handleMouseDown = (e) => {
    if (!imageLoaded) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile/tablets
  const handleTouchStart = (e) => {
    if (!imageLoaded || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  // Draw preview canvas
  useEffect(() => {
    if (!canvasRef.current || !imageObjRef.current || !imageLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const img = imageObjRef.current;

    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Center pivot
    ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect ratio preserving dimensions
    const imgRatio = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;

    if (imgRatio > 1) {
      drawWidth = size * imgRatio;
      drawHeight = size;
    } else {
      drawWidth = size;
      drawHeight = size / imgRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    ctx.restore();
  }, [pan, zoom, rotation, imageLoaded]);

  // Export cropped circular image
  const handleConfirmCrop = () => {
    if (!imageObjRef.current || !imageLoaded) {
      onSave(null);
      onClose();
      return;
    }

    // Create high-res output canvas (400x400)
    const outCanvas = document.createElement('canvas');
    const outSize = 400;
    outCanvas.width = outSize;
    outCanvas.height = outSize;
    const outCtx = outCanvas.getContext('2d');

    // Circular clipping mask
    outCtx.beginPath();
    outCtx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
    outCtx.closePath();
    outCtx.clip();

    // Scale ratio from preview (300) to output (400)
    const scaleFactor = outSize / 300;

    outCtx.translate(outSize / 2 + pan.x * scaleFactor, outSize / 2 + pan.y * scaleFactor);
    outCtx.rotate((rotation * Math.PI) / 180);
    outCtx.scale(zoom * scaleFactor, zoom * scaleFactor);

    const img = imageObjRef.current;
    const imgRatio = img.width / img.height;
    let drawWidth = 300;
    let drawHeight = 300;
    if (imgRatio > 1) {
      drawWidth = 300 * imgRatio;
      drawHeight = 300;
    } else {
      drawWidth = 300;
      drawHeight = 300 / imgRatio;
    }

    outCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    const croppedDataUrl = outCanvas.toDataURL('image/png', 0.92);
    onSave(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] border-2 border-[#1e4d2b]/30 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#245233] text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h3 className="text-lg font-heading tracking-wider font-semibold">
              Foto do Membro • Recorte Circular & Zoom
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Controls to pick image */}
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 bg-[#1b4d3e] hover:bg-[#153e32] text-amber-50 font-medium py-2.5 px-4 rounded-xl cursor-pointer text-sm transition shadow-sm border border-emerald-600/30">
              <Upload size={17} />
              <span>Carregar do Computador</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="flex-1 flex items-center gap-1.5 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 focus-within:border-emerald-700">
              <LinkIcon size={16} className="text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Ou cole o link da foto..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                className="w-full text-xs outline-none bg-transparent text-stone-700 placeholder:text-stone-400"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="bg-stone-200 hover:bg-emerald-700 hover:text-white text-stone-700 px-2 py-1 rounded text-xs font-medium transition"
              >
                Carregar
              </button>
            </div>
          </div>

          {/* Interactive Crop Viewport */}
          <div className="flex flex-col items-center justify-center bg-stone-100 rounded-xl p-4 border border-stone-300/80 relative">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              onWheel={handleWheel}
              className={`relative w-[300px] h-[300px] rounded-full overflow-hidden bg-stone-200 border-4 border-amber-600/60 shadow-inner select-none ${
                imageLoaded ? 'cursor-grab active:cursor-grabbing' : 'flex items-center justify-center'
              }`}
            >
              {imageLoaded ? (
                <>
                  <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
                  {/* Subtle crosshair / drag hint indicator */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                    <Move size={28} className="text-white drop-shadow" />
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-stone-500 text-sm flex flex-col items-center gap-2">
                  <span className="text-4xl opacity-50">👤</span>
                  <p className="text-xs">Selecione uma foto do seu computador ou informe um link acima para recortar.</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1">
              <span>💡</span> Clique e arraste a foto para posicionar. Use o slider ou a roda do mouse para dar zoom.
            </p>
          </div>

          {/* Zoom and Rotate adjustments */}
          {imageLoaded && (
            <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1 text-emerald-900">
                  <ZoomIn size={16} /> Nível de Zoom ({zoom.toFixed(1)}x)
                </span>
                <span className="text-stone-400">0.5x - 4x</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut size={16} className="text-stone-400" />
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#1b4d3e] cursor-pointer"
                />
                <ZoomIn size={16} className="text-stone-700" />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex items-center gap-1 text-stone-600 hover:text-emerald-800 font-medium py-1 px-2 rounded hover:bg-stone-100 transition"
                >
                  <RotateCw size={14} /> Girar 90°
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                    setRotation(0);
                  }}
                  className="text-stone-500 hover:text-stone-800 text-xs"
                >
                  Centralizar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSave(null);
              onClose();
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
          >
            Remover Foto
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              disabled={!imageLoaded}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-medium text-sm text-white shadow-md transition ${
                imageLoaded
                  ? 'bg-[#1b4d3e] hover:bg-[#133926] cursor-pointer'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Check size={16} /> Salvar Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
