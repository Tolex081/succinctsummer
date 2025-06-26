// BannerPreview.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import xIcon from '../assets/x-icon.png';

function BannerPreview({ selectedTemplate, pfp, xUsername }) {
  const canvasRef = useRef(null);
  const imageCache = useRef({});
  const [pfpSize, setPfpSize] = useState({ width: 100, height: 100 });
  const [fontSize, setFontSize] = useState(20);
  const [pfpRotation, setPfpRotation] = useState(0);
  const [xRotation, setXRotation] = useState(0);
  const [tempXUsername, setTempXUsername] = useState(xUsername);
  const [pfpPosition, setPfpPosition] = useState({ x: 50, y: 50 });
  const [xPosition, setXPosition] = useState({ x: 200, y: 100 });
  const [isExporting, setIsExporting] = useState(false);
  const [templateDimensions, setTemplateDimensions] = useState({ width: 800, height: 200 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 800, height: 200 });
  const containerRef = useRef(null);

  useEffect(() => {
    setTempXUsername(xUsername);
  }, [xUsername]);

  const loadImage = useCallback((src) => {
    if (imageCache.current[src]) return Promise.resolve(imageCache.current[src]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.current[src] = img;
        resolve(img);
      };
      img.onerror = reject;
    });
  }, []);

  // Load template and get its natural dimensions
  useEffect(() => {
    if (selectedTemplate) {
      loadImage(selectedTemplate.src).then((img) => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        setTemplateDimensions({
          width: naturalWidth,
          height: naturalHeight
        });

        // Calculate display dimensions (with max constraints)
        const maxWidth = 1200;
        const maxHeight = 400;
        const aspectRatio = naturalWidth / naturalHeight;
        
        let displayWidth = naturalWidth;
        let displayHeight = naturalHeight;
        
        if (displayWidth > maxWidth) {
          displayWidth = maxWidth;
          displayHeight = displayWidth / aspectRatio;
        }
        
        if (displayHeight > maxHeight) {
          displayHeight = maxHeight;
          displayWidth = displayHeight * aspectRatio;
        }
        
        setDisplayDimensions({
          width: displayWidth,
          height: displayHeight
        });
      }).catch(console.error);
    }
  }, [selectedTemplate, loadImage]);

  const drawCanvas = useCallback(async () => {
    if (!selectedTemplate) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Use natural dimensions of the template image
    canvas.width = templateDimensions.width;
    canvas.height = templateDimensions.height;

    // Calculate scale factors to convert display positions to canvas positions
    const scaleX = templateDimensions.width / displayDimensions.width;
    const scaleY = templateDimensions.height / displayDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Draw template at its natural size
      const templateImg = await loadImage(selectedTemplate.src);
      ctx.drawImage(templateImg, 0, 0, templateDimensions.width, templateDimensions.height);

      // Draw PFP if available (scale positions and sizes)
      if (pfp) {
        const pfpImg = await loadImage(pfp);
        const scaledX = pfpPosition.x * scaleX;
        const scaledY = pfpPosition.y * scaleY;
        const scaledWidth = pfpSize.width * scaleX;
        const scaledHeight = pfpSize.height * scaleY;
        
        ctx.save();
        ctx.translate(scaledX + scaledWidth / 2, scaledY + scaledHeight / 2);
        ctx.rotate((pfpRotation * Math.PI) / 180);
        ctx.drawImage(pfpImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
      }

      // Draw X icon and username (scale positions and sizes)
      if (tempXUsername) {
        const iconImg = await loadImage(xIcon);
        const scaledX = xPosition.x * scaleX;
        const scaledY = xPosition.y * scaleY;
        const scaledFontSize = fontSize * scaleX;
        
        ctx.save();
        ctx.translate(scaledX, scaledY);
        ctx.rotate((xRotation * Math.PI) / 180);
        ctx.drawImage(iconImg, 0, -scaledFontSize, scaledFontSize, scaledFontSize);
        ctx.font = `bold ${scaledFontSize}px Arial`;
        ctx.fillStyle = '#000';
        ctx.fillText(tempXUsername, scaledFontSize + 5, 0);
        ctx.restore();
      }
    } catch (err) {
      console.error('Error drawing canvas:', err);
    }
  }, [
    selectedTemplate,
    templateDimensions,
    displayDimensions,
    loadImage,
    pfp,
    pfpRotation,
    pfpPosition,
    pfpSize,
    xPosition,
    xRotation,
    fontSize,
    tempXUsername
  ]);

  // Only draw canvas during export
  useEffect(() => {
    if (isExporting && templateDimensions.width > 0 && displayDimensions.width > 0) {
      drawCanvas();
    }
  }, [drawCanvas, isExporting, templateDimensions, displayDimensions]);

  const handleDownload = async () => {
    setIsExporting(true);
    await drawCanvas();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'custom-banner.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  const handleShare = async () => {
    setIsExporting(true);
    await drawCanvas();
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'custom-banner.png';
    link.href = imageDataUrl;
    link.click();
    const caption = encodeURIComponent(
      'Check out my custom banner Created with a cool banner generator create yours here https://succinctsummer.vercel.app/!'
    );
    window.open(`https://x.com/intent/tweet?text=${caption}`, '_blank');
    alert('Banner downloaded. Attach "custom-banner.png" manually in the tweet.');
    setIsExporting(false);
  };

  return (
    <div className="banner-preview">
      <h2>Preview Your Banner</h2>
      <p className="drag-instructions">
        Drag and resize your PFP or X text/icon. Works on mobile and desktop.
      </p>
      {selectedTemplate ? (
        <>
          <div
            ref={containerRef}
            className="canvas-container"
            style={{
              position: 'relative',
              background: '#fff',
              width: displayDimensions.width,
              height: displayDimensions.height,
              overflow: 'hidden',
              margin: '0 auto'
            }}
          >
            {/* Hidden canvas for final rendering */}
            <canvas
              ref={canvasRef}
              className="hidden-canvas"
              style={{
                display: 'none'
              }}
            />

            {/* Background template image */}
            <img
              src={selectedTemplate.src}
              alt="Template"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                zIndex: 0
              }}
            />

            {/* PFP Draggable Component */}
            <Rnd
              bounds="parent"
              size={pfpSize}
              position={pfpPosition}
              onDragStop={(e, d) => setPfpPosition({ x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                setPfpSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                setPfpPosition(position);
              }}
              enableResizing={true}
              resizeHandleStyles={{
                top: { cursor: 'ns-resize' },
                right: { cursor: 'ew-resize' },
                bottom: { cursor: 'ns-resize' },
                left: { cursor: 'ew-resize' },
                topRight: { cursor: 'ne-resize' },
                bottomRight: { cursor: 'se-resize' },
                bottomLeft: { cursor: 'sw-resize' },
                topLeft: { cursor: 'nw-resize' }
              }}
              style={{
                border: '2px dashed #90DCFF',
                background: 'transparent',
                touchAction: 'none',
                zIndex: 10
              }}
            >
              {pfp && (
                <img
                  src={pfp}
                  alt="PFP"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `rotate(${pfpRotation}deg)`,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </Rnd>

            {/* X Username Draggable Component */}
            <Rnd
              bounds="parent"
              size={{ width: Math.max(fontSize * 8, 150), height: fontSize * 2 }}
              position={xPosition}
              onDragStop={(e, d) => setXPosition({ x: d.x, y: d.y })}
              enableResizing={false}
              style={{
                border: '1px dashed #781961',
                padding: '0.25rem',
                background: 'rgba(255, 255, 255, 0.8)',
                touchAction: 'none',
                zIndex: 10
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  transform: `rotate(${xRotation}deg)`,
                  pointerEvents: 'none'
                }}
              >
                <img
                  src={xIcon}
                  alt="X icon"
                  style={{ width: fontSize, height: fontSize, marginRight: '0.5rem' }}
                />
                <span style={{ fontSize, fontWeight: 'bold', color: '#000' }}>
                  {tempXUsername}
                </span>
              </div>
            </Rnd>
          </div>

          <div className="controls">
            <div className="control-group">
              <label>PFP Rotation: {pfpRotation}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={pfpRotation}
                onChange={(e) => setPfpRotation(Number(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Text/Icon Size: {fontSize}px</label>
              <input
                type="range"
                min="12"
                max="40"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>X Rotation: {xRotation}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={xRotation}
                onChange={(e) => setXRotation(Number(e.target.value))}
              />
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