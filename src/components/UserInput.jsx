import React, { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

function UserInput({ setPfp, setXUsername }) {
  const [isLoading, setIsLoading] = useState(false);
  const [removeBackgroundEnabled, setRemoveBackgroundEnabled] = useState(false);

  const handlePfpUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    try {
      if (removeBackgroundEnabled) {
        // Remove background if enabled
        const blob = file;
        const resultBlob = await removeBackground(blob, {
          output: { format: 'image/png' },
        });
        const reader = new FileReader();
        reader.onload = () => {
          setPfp(reader.result);
          setIsLoading(false);
        };
        reader.readAsDataURL(resultBlob);
      } else {
        // Use original image without background removal
        const reader = new FileReader();
        reader.onload = () => {
          setPfp(reader.result);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      // Fallback to original image if background removal fails
      const reader = new FileReader();
      reader.onload = () => {
        setPfp(reader.result);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="user-input">
      <style>
        {`
          .user-input {
            font-family: 'Montserrat', sans-serif;
          }
          
          .user-input input[type="text"] {
            font-family: 'Montserrat', sans-serif;
            font-weight: 400;
          }
          
          .user-input label {
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
          }
          
          .user-input h2 {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
          }
          
          .background-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            font-family: 'Montserrat', sans-serif;
          }
          
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
          }
          
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
          }
          
          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          input:checked + .toggle-slider {
            background-color: #1DA1F2;
          }
          
          input:checked + .toggle-slider:before {
            transform: translateX(26px);
          }
          
          .loading-text {
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
            color: #1DA1F2;
          }
        `}
      </style>
      
      <h2>Customize Your Banner</h2>
      
      <div className="input-group">
        <label>Upload Profile Picture:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePfpUpload}
          disabled={isLoading}
        />
        
        <div className="background-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={removeBackgroundEnabled}
              onChange={(e) => setRemoveBackgroundEnabled(e.target.checked)}
              disabled={isLoading}
            />
            <span className="toggle-slider"></span>
          </label>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            Remove background automatically
          </span>
        </div>
        
        {isLoading && (
          <p className="loading-text">
            {removeBackgroundEnabled 
              ? "Removing background... Please be patient..." 
              : "Processing image..."}
          </p>
        )}
      </div>
      
      <div className="input-group">
        <label>X Username:</label>
        <input
          type="text"
          onChange={(e) => setXUsername(e.target.value)}
          placeholder="Your X username"
        />
      </div>
    </div>
  );
}

export default UserInput;