import React, { useRef, useEffect, useState, useCallback } from 'react';
import xIcon from '../assets/x-icon.png';

function BannerPreview({ selectedTemplate, pfp, xUsername }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const imageCache = useRef({});
  const [pfpPos, setPfpPos] = useState({ x: 50, y: 50 });
  const [xTextPos, setXTextPos] = useState({ x: 200, y: 100 });
  const [pfpSize, setPfpSize] = useState(100);
  const [fontSize, setFontSize] = useState(20);
  const [pfpRotation, setPfpRotation] = useState(0);
  const [xRotation, setXRotation] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState(null);
  const [tempXUsername, setTempXUsername] = useState(xUsername);
  const dragTimeout = useRef(null);

  useEffect(() => {
    setTempXUsername(xUsername);
  }, [xUsername]);

  const loadImage = useCallback((src) => {
    if (imageCache.current[src]) return Promise.resolve(imageCache.current[src]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.current[src] = img;
        resolve(img);
      };
      img.onerror = reject;
    });
  }, []);

  useEffect(() => {
    if (!selectedTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    canvas.width = 800;
    canvas.height = 200;

    const drawCanvas = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try {
        const templateImg = await loadImage(selectedTemplate.src);
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        if (pfp) {
          const pfpImg = await loadImage(pfp);
          ctx.save();
          ctx.translate(pfpPos.x + pfpSize / 2, pfpPos.y + pfpSize / 2);
          ctx.rotate((pfpRotation * Math.PI) / 180);
          ctx.drawImage(pfpImg, -pfpSize / 2, -pfpSize / 2, pfpSize, pfpSize);
          ctx.restore();
        }

        ctx.save();
        ctx.translate(xTextPos.x + fontSize * 1.25 / 2, xTextPos.y);
        ctx.rotate((xRotation * Math.PI) / 180);
        const icon = await loadImage(xIcon);
        ctx.drawImage(icon, -fontSize * 1.25 / 2, -fontSize * 0.75, fontSize, fontSize);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#000';
        ctx.fillText(tempXUsername || 'N/A', -fontSize * 1.25 / 2 + fontSize * 1.25, 0);
        ctx.restore();
      } catch (err) {
        console.error(err);
      }
    };

    drawCanvas();
  });

  const debounceDrag = useCallback((updateFn, newPos) => {
    if (dragTimeout.current) clearTimeout(dragTimeout.current);
    dragTimeout.current = setTimeout(() => updateFn(newPos), 16);
  }, []);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleStart = (e) => {
    const { x, y } = getCoords(e);
    const ctx = ctxRef.current;

    // Check PFP drag
    if (
      pfp &&
      x >= pfpPos.x &&
      x <= pfpPos.x + pfpSize &&
      y >= pfpPos.y &&
      y <= pfpPos.y + pfpSize
    ) {
      setDragging('pfp');
      setOffset({ x: x - pfpPos.x, y: y - pfpPos.y });
      setEditing(null);
      return;
    }

    // Check X text drag
    const xWidth = ctx.measureText(tempXUsername || 'N/A').width + fontSize * 1.25;
    if (
      x >= xTextPos.x &&
      x <= xTextPos.x + xWidth &&
      y >= xTextPos.y - fontSize &&
      y <= xTextPos.y
    ) {
      if (!e.touches && e.detail === 2) {
        setEditing('x');
      } else {
        setDragging('x');
        setOffset({ x: x - xTextPos.x, y: y - xTextPos.y });
      }
      return;
    }

    setEditing(null);
  };

  const handleMove = (e) => {
    if (!dragging) return;
    const { x, y } = getCoords(e);
    const canvas = canvasRef.current;

    if (dragging === 'pfp') {
      const newX = Math.max(0, Math.min(x - offset.x, canvas.width - pfpSize));
      const newY = Math.max(0, Math.min(y - offset.y, canvas.height - pfpSize));
      debounceDrag(setPfpPos, { x: newX, y: newY });
    } else if (dragging === 'x') {
      const newX = Math.max(0, Math.min(x - offset.x, canvas.width - fontSize * 8));
      const newY = Math.max(fontSize, Math.min(y - offset.y, canvas.height));
      debounceDrag(setXTextPos, { x: newX, y: newY });
    }

    if (e.cancelable) e.preventDefault();
  };

  const handleEnd = () => {
    setDragging(null);
    if (dragTimeout.current) clearTimeout(dragTimeout.current);
  };

  const handlePfpSizeChange = (e) => setPfpSize(Number(e.target.value));
  const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));
  const handlePfpRotationChange = (e) => setPfpRotation(Number(e.target.value));
  const handleXRotationChange = (e) => setXRotation(Number(e.target.value));
  const handleXEdit = (e) => setTempXUsername(e.target.value);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'custom-banner.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = () => {
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'custom-banner.png';
    link.href = imageDataUrl;
    link.click();
    const caption = encodeURIComponent('Check out my custom banner Created with a cool banner generator create yours  here https://succinctsummer.vercel.app/!');
    window.open(`https://x.com/intent/tweet?text=${caption}`, '_blank');
    alert('Banner downloaded. Attach "custom-banner.png" manually in the tweet.');
  };

  return (
    <div className="banner-preview">
      <h2>Preview Your Banner</h2>
      <p className="drag-instructions">
        Drag PFP or X text. Double-click/tap username to edit. Use sliders to resize/rotate.
      </p>
      {selectedTemplate ? (
        <>
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            ></canvas>
            {editing === 'x' && (
              <input
                type="text"
                value={tempXUsername}
                onChange={handleXEdit}
                className="edit-input"
                style={{
                  position: 'absolute',
                  left: `${xTextPos.x + fontSize * 1.25}px`,
                  top: `${xTextPos.y - fontSize * 0.75}px`,
                  width: `${ctxRef.current?.measureText(tempXUsername || 'N/A').width || 100}px`,
                  transform: `rotate(${xRotation}deg)`,
                }}
                onBlur={() => setEditing(null)}
                autoFocus
              />
            )}
          </div>
          <div className="controls">
            <div className="control-group">
              <label>PFP Size: {pfpSize}px</label>
              <input type="range" min="50" max="200" value={pfpSize} onChange={handlePfpSizeChange} />
            </div>
            <div className="control-group">
              <label>PFP Rotation: {pfpRotation}°</label>
              <input type="range" min="0" max="360" value={pfpRotation} onChange={handlePfpRotationChange} />
            </div>
            <div className="control-group">
              <label>Text/Icon Size: {fontSize}px</label>
              <input type="range" min="12" max="40" value={fontSize} onChange={handleFontSizeChange} />
            </div>
            <div className="control-group">
              <label>X Rotation: {xRotation}°</label>
              <input type="range" min="0" max="360" value={xRotation} onChange={handleXRotationChange} />
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={handleDownload}>Download Banner</button>
            <button onClick={handleShare}>Share to X</button>
          </div>
        </>
      ) : (
        <p>Please select a template to preview.</p>
      )}
    </div>
  );
}

export default BannerPreview;
