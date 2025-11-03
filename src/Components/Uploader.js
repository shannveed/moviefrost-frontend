// Frontend/src/Components/Uploader.js
import React, { useState } from 'react';
import Axios from '../Redux/APIs/Axios';

function Uploader({ setImageUrl }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setError('');

    if (!file) {
      setError('Please select a file first.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('You can only upload an image under 1MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const { data } = await Axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data?.success && data?.url) {
        // url is now your R2+CDN public URL
        setImageUrl(data.url);
        setFile(null);
      } else {
        setError(data?.message || 'Upload failed. Try again.');
      }
    } catch (e) {
      console.error('[Uploader] upload error:', e);
      setError(e?.response?.data?.message || e?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="uploader flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError('');
          }}
          className="border border-gray-300 p-2 rounded flex-1"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`bg-customPurple text-white px-4 py-2 rounded ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

export default Uploader;