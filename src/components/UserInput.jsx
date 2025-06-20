import React, { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

function UserInput({ setPfp, setXUsername }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePfpUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    try {
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
    } catch (error) {
      console.error('Background removal failed:', error);
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
      <h2>Customize Your Banner</h2>
      <div className="input-group">
        <label>Upload Profile Picture:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePfpUpload}
          disabled={isLoading}
        />
        {isLoading && <p className="loading-text">Removing background...</p>}
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