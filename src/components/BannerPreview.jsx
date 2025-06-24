import React, { useRef, useEffect, useState, useCallback } from 'react';
import xIcon from '../assets/x-icon.png';

function BannerPreview({ selectedTemplate, pfp, xUsername }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const imageCache = useRef({});
  const [pfpPos, setPfpPos] = useState({ x: 50, y: 50 });
  const [xPos, setXPos] = useState({ x: 200, y: 100 });
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
    if (imageCache.current[src]) {
      return Promise.resolve(imageCache.current[src]);
    }
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
        ctx.translate(xPos.x + fontSize * 1.25 / 2, xPos.y);
        ctx.rotate((xRotation * Math.PI) / 180);
        const xIconImg = await loadImage(xIcon);
        ctx.drawImage(xIconImg, -fontSize * 1.25 / 2, -fontSize * 0.75, fontSize, fontSize);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#000';
        ctx.fillText(tempXUsername || 'N/A', -fontSize * 1.25 / 2 + fontSize * 1.25, 0);
        ctx.restore();
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    drawCanvas();
  });

  const debounceDrag = useCallback((updateFn, newPos) => {
    if (dragTimeout.current) clearTimeout(dragTimeout.current);
    dragTimeout.current = setTimeout(() => {
      updateFn(newPos);
    }, 16);
  }, []);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
      pfp &&
      mouseX >= pfpPos.x &&
      mouseX <= pfpPos.x + pfpSize &&
      mouseY >= pfpPos.y &&
      mouseY <= pfpPos.y + pfpSize
    ) {
      setDragging('pfp');
      setOffset({ x: mouseX - pfpPos.x, y: mouseY - pfpPos.y });
      setEditing(null);
      return;
    }

    const xWidth = ctx.measureText(tempXUsername || 'N/A').width + fontSize * 1.25;
    if (
      mouseX >= xPos.x &&
      mouseX <= xPos.x + xWidth &&
      mouseY >= xPos.y - fontSize &&
      mouseY <= xPos.y
    ) {
      if (e.detail === 2) {
        setEditing('x');
      } else {
        setDragging('x');
        setOffset({ x: mouseX - xPos.x, y: mouseY - xPos.y });
      }
      return;
    }

    setEditing(null);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (dragging === 'pfp') {
      const newX = Math.max(0, Math.min(mouseX - offset.x, canvas.width - pfpSize));
      const newY = Math.max(0, Math.min(mouseY - offset.y, canvas.height - pfpSize));
      debounceDrag(setPfpPos, { x: newX, y: newY });
    } else if (dragging === 'x') {
      const newX = Math.max(0, Math.min(mouseX - offset.x, canvas.width - fontSize));
      const newY = Math.max(fontSize, Math.min(mouseY - offset.y, canvas.height));
      debounceDrag(setXPos, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    if (dragTimeout.current) clearTimeout(dragTimeout.current);
  };

  // --- MOBILE TOUCH SUPPORT ---
  const getTouchPosition = (touch) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = getTouchPosition(touch);
    const ctx = ctxRef.current;

    if (
      pfp &&
      touchX >= pfpPos.x &&
      touchX <= pfpPos.x + pfpSize &&
      touchY >= pfpPos.y &&
      touchY <= pfpPos.y + pfpSize
    ) {
      setDragging('pfp');
      setOffset({ x: touchX - pfpPos.x, y: touchY - pfpPos.y });
      setEditing(null);
      return;
    }

    const xWidth = ctx.measureText(tempXUsername || 'N/A').width + fontSize * 1.25;
    if (
      touchX >= xPos.x &&
      touchX <= xPos.x + xWidth &&
      touchY >= xPos.y - fontSize &&
      touchY <= xPos.y
    ) {
      setDragging('x');
      setOffset({ x: touchX - xPos.x, y: touchY - xPos.y });
      setEditing(null);
      return;
    }

    setEditing(null);
  };

  const handleTouchMove = (e) => {
    if (!dragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = getTouchPosition(touch);
    const canvas = canvasRef.current;

    if (dragging === 'pfp') {
      const newX = Math.max(0, Math.min(touchX - offset.x, canvas.width - pfpSize));
      const newY = Math.max(0, Math.min(touchY - offset.y, canvas.height - pfpSize));
      debounceDrag(setPfpPos, { x: newX, y: newY });
    } else if (dragging === 'x') {
      const newX = Math.max(0, Math.min(touchX - offset.x, canvas.width - fontSize));
      const newY = Math.max(fontSize, Math.min(touchY - offset.y, canvas.height));
      debounceDrag(setXPos, { x: newX, y: newY });
    }

    e.preventDefault(); // prevent scrolling while dragging
  };

  const handleTouchEnd = () => {
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

    const caption = encodeURIComponent('Check out my custom banner! Created with a cool banner generator.');
    const xIntentUrl = `https://x.com/intent/tweet?text=${caption}`;
    window.open(xIntentUrl, '_blank');
    alert('Banner downloaded. Click the image icon in the X window to attach "custom-banner.png".');
  };

  return (
    <div className="banner-preview">
      <h2>Preview Your Banner</h2>
      <p className="drag-instructions">
        Drag elements on desktop or mobile. Double-tap username to edit. Resize/rotate below.
      </p>
      {selectedTemplate ? (
        <>
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
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
                  left: `${xPos.x + fontSize * 1.25}px`,
                  top: `${xPos.y - fontSize * 0.75}px`,
                  width: `${ctxRef.current?.measureText(tempXUsername || 'N/A').width}px`,
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
