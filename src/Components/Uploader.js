// Uploader.js
import React, { useState } from 'react';
import axios from 'axios';

function Uploader({ setImageUrl }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    // Check if the file size exceeds 1MB (1,048,576 bytes)
    if (file.size > 1024 * 1024) {
      setError('You can only upload image under 1MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload to our backend API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const { data } = await axios.post(
        `${apiUrl.replace(/\/api$/, '')}/api/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (data.success && data.url) {
        setImageUrl(data.url);
        setError(null);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.message || error.message || 'Failed to upload image.');
    }
  };

  return (
    <div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="uploader flex gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setError(null); // Clear previous errors when a new file is selected
          }}
          className="border border-gray-300 p-2 rounded"
        />
        <button
          onClick={handleUpload}
          className="bg-customPurple text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>
    </div>
  );
}

export default Uploader;
