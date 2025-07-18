// Uploader.js
import React, { useState, useMemo } from 'react';
import { Client, Storage, Permission, Role } from 'appwrite';

function Uploader({ setImageUrl }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Appwrite client and storage using useMemo
  const { storage, configError } = useMemo(() => {
    const endpoint = process.env.REACT_APP_APPWRITE_ENDPOINT;
    const projectId = process.env.REACT_APP_APPWRITE_PROJECT_ID;

    // Check if required environment variables are defined
    if (!endpoint || !projectId) {
      return {
        configError: 'Appwrite configuration is missing in environment variables.',
        client: null,
        storage: null,
      };
    }

    const clientInstance = new Client();
    clientInstance.setEndpoint(endpoint).setProject(projectId);
    const storageInstance = new Storage(clientInstance);

    return {
      client: clientInstance,
      storage: storageInstance,
      configError: null,
    };
  }, []); // Empty dependency array since env variables won't change during runtime

  // If there's a configuration error, show it
  if (configError) {
    return <div className="text-red-500">{configError}</div>;
  }

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

    const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;
    if (!bucketId) {
      setError('Bucket ID is missing in environment variables.');
      return;
    }

    try {
      // Upload the file to Appwrite with public read permissions
      const response = await storage.createFile(
        bucketId,
        'unique()',
        file,
        [Permission.read(Role.any())] // Set public read permissions
      );

      // Get the image URL using the getFileView method
      const imageUrl = storage.getFileView(bucketId, response.$id);

      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image.');
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
