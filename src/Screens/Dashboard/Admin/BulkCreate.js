// Frontend/src/Screens/Dashboard/Admin/BulkCreate.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import SideBar from '../SideBar';
import Axios from '../../../Redux/APIs/Axios';

const SAMPLE_PAYLOAD = `{
  "movies": [
    {
      "type": "Movie",
      "name": "Example Movie",
      "desc": "Short description...",
      "image": "https://cdn.moviefrost.com/uploads/example-poster.jpg",
      "titleImage": "https://cdn.moviefrost.com/uploads/example-title.jpg",
      "category": "Action",
      "browseBy": "Hollywood (English)",
      "thumbnailInfo": "HD",
      "language": "English",
      "year": 2024,
      "time": 120,
      "video": "https://server1.example.com/stream.m3u8",
      "videoUrl2": "https://server2.example.com/stream.m3u8",
      "videoUrl3": "https://server3.example.com/stream.m3u8",
      "downloadUrl": "",
      "latest": false,
      "previousHit": false,
      "isPublished": false
    },
    {
      "type": "WebSeries",
      "name": "Example Series",
      "desc": "Series description...",
      "image": "https://cdn.moviefrost.com/uploads/series-poster.jpg",
      "titleImage": "https://cdn.moviefrost.com/uploads/series-title.jpg",
      "category": "Drama",
      "browseBy": "Hollywood Web Series (English)",
      "thumbnailInfo": "S01",
      "language": "English",
      "year": 2024,
      "time": 480,
      "latest": false,
      "previousHit": false,
      "isPublished": false,
      "episodes": [
        {
          "seasonNumber": 1,
          "episodeNumber": 1,
          "title": "Episode 1",
          "duration": 45,
          "desc": "Episode description...",
          "video": "https://server1.example.com/ep1.m3u8",
          "videoUrl2": "https://server2.example.com/ep1.m3u8",
          "videoUrl3": "https://server3.example.com/ep1.m3u8"
        }
      ]
    }
  ]
}`;

const parseMoviesFromText = (text) => {
  if (!text || !text.trim()) throw new Error('Paste your JSON first.');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON. Please fix the JSON and try again.');
  }

  const movies = Array.isArray(parsed) ? parsed : parsed?.movies;

  if (!Array.isArray(movies)) {
    throw new Error(
      'JSON must be either an array of movies OR an object like: { "movies": [ ... ] }'
    );
  }
  if (movies.length === 0) throw new Error('Movies array is empty.');

  return movies;
};

const chunkArray = (arr, size) => {
  if (!size || size <= 0) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export default function BulkCreate() {
  const { userInfo } = useSelector((state) => state.userLogin || {});
  const token = userInfo?.token;

  const [raw, setRaw] = useState('');
  const [chunkSize, setChunkSize] = useState(50);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // { current, total }
  const [result, setResult] = useState(null); // { submitted, inserted, errors }

  const handleUseSample = () => {
    setRaw(SAMPLE_PAYLOAD);
    setResult(null);
  };

  const handleFormat = () => {
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      setRaw(JSON.stringify(parsed, null, 2));
      toast.success('Formatted JSON');
    } catch {
      toast.error('Cannot format: invalid JSON');
    }
  };

  const handleValidate = () => {
    try {
      const movies = parseMoviesFromText(raw);
      toast.success(`Valid JSON. Movies: ${movies.length}`);
    } catch (e) {
      toast.error(e.message || 'Invalid JSON');
    }
  };

  const handleUpload = async () => {
    if (!token) {
      toast.error('You must be logged in as admin.');
      return;
    }

    let movies;
    try {
      movies = parseMoviesFromText(raw);
    } catch (e) {
      toast.error(e.message || 'Invalid JSON');
      return;
    }

    const size = Number(chunkSize);
    const effectiveChunkSize =
      Number.isFinite(size) && size > 0 ? Math.floor(size) : 0;

    const chunks = chunkArray(movies, effectiveChunkSize);

    let insertedTotal = 0;
    let allErrors = [];
    let globalOffset = 0;

    setUploading(true);
    setResult(null);
    setProgress({ current: 0, total: chunks.length });

    try {
      for (let i = 0; i < chunks.length; i++) {
        setProgress({ current: i + 1, total: chunks.length });

        const chunk = chunks[i];

        const { data } = await Axios.post(
          '/movies/bulk',
          { movies: chunk },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 300000, // 5 minutes (bulk insert can take time)
          }
        );

        const insertedCount = Number(
          data?.insertedCount || data?.inserted?.length || 0
        );
        insertedTotal += insertedCount;

        const chunkErrors = Array.isArray(data?.errors) ? data.errors : [];
        if (chunkErrors.length) {
          allErrors = allErrors.concat(
            chunkErrors.map((err) => ({
              ...err,
              chunk: i + 1,
              globalIndex:
                typeof err?.index === 'number'
                  ? globalOffset + err.index
                  : undefined,
            }))
          );
        }

        globalOffset += chunk.length;
      }

      setResult({
        submitted: movies.length,
        inserted: insertedTotal,
        errors: allErrors,
      });

      toast.success(
        `Bulk upload complete. Inserted: ${insertedTotal}. Errors: ${allErrors.length}`
      );
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || 'Bulk upload failed'
      );
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const downloadErrors = () => {
    if (!result?.errors?.length) return;

    const blob = new Blob([JSON.stringify(result.errors, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-create-errors-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <SideBar>
      <div className="text-white flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold">Bulk Create</h2>
          <p className="text-sm text-dryGray mt-1">
            Paste the same JSON you send to{' '}
            <code className="text-white">POST /api/movies/bulk</code>
          </p>
        </div>

        <div className="bg-main border border-border rounded-lg p-4 text-sm text-dryGray space-y-2">
          <p className="text-white font-semibold">Supported JSON formats:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <code className="text-white">[{"{...}"}, {"{...}"}]</code>
            </li>
            <li>
              <code className="text-white">{`{ "movies": [ ... ] }`}</code>
            </li>
          </ul>
          <p className="text-xs">
            Notes: <span className="text-white">time</span> and{' '}
            <span className="text-white">year</span> must be numbers (minutes /
            year). For WebSeries episodes,{' '}
            <span className="text-white">duration</span> should be minutes.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-border">
              Chunk size (0 = single request)
            </label>
            <input
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.target.value)}
              className="bg-main border border-border rounded px-3 py-2 text-sm text-white outline-none focus:border-customPurple w-56"
              min={0}
            />
          </div>

          <button
            type="button"
            onClick={handleUseSample}
            className="px-4 py-2 rounded border border-border bg-dry hover:bg-main transitions text-sm"
          >
            Use Sample
          </button>

          <button
            type="button"
            onClick={handleFormat}
            className="px-4 py-2 rounded border border-border bg-dry hover:bg-main transitions text-sm"
          >
            Format JSON
          </button>

          <button
            type="button"
            onClick={handleValidate}
            className="px-4 py-2 rounded border border-customPurple text-white hover:bg-customPurple transitions text-sm"
          >
            Validate
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!token || uploading}
            className="ml-auto px-6 py-2 rounded bg-customPurple hover:bg-opacity-90 transitions text-sm font-semibold disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Input */}
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Paste your JSON here..."
          className="w-full min-h-[60vh] bg-black border border-border rounded-lg p-4 text-xs font-mono text-white outline-none focus:border-customPurple"
        />

        {/* Progress */}
        {uploading && progress && (
          <div className="bg-dry border border-border rounded-lg p-4">
            <p className="text-sm text-white">
              Uploading chunk {progress.current} / {progress.total}...
            </p>
            <p className="text-xs text-dryGray mt-1">
              Keep this tab open until it finishes.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-dry border border-border rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <p>
                Submitted:{' '}
                <span className="text-customPurple font-semibold">
                  {result.submitted}
                </span>
              </p>
              <p>
                Inserted:{' '}
                <span className="text-green-500 font-semibold">
                  {result.inserted}
                </span>
              </p>
              <p>
                Errors:{' '}
                <span className="text-red-500 font-semibold">
                  {result.errors?.length || 0}
                </span>
              </p>

              {result.errors?.length > 0 && (
                <button
                  type="button"
                  onClick={downloadErrors}
                  className="ml-auto px-3 py-2 rounded border border-customPurple text-customPurple hover:bg-customPurple hover:text-white transitions text-xs"
                >
                  Download errors JSON
                </button>
              )}
            </div>

            {result.errors?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-border">
                  <thead className="bg-main text-white">
                    <tr>
                      <th className="text-left p-2 border-b border-border">#</th>
                      <th className="text-left p-2 border-b border-border">
                        Chunk
                      </th>
                      <th className="text-left p-2 border-b border-border">
                        Index
                      </th>
                      <th className="text-left p-2 border-b border-border">
                        Name
                      </th>
                      <th className="text-left p-2 border-b border-border">
                        Type
                      </th>
                      <th className="text-left p-2 border-b border-border">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-dry">
                    {result.errors.slice(0, 200).map((e, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{e.chunk || '-'}</td>
                        <td className="p-2">
                          {typeof e.globalIndex === 'number'
                            ? e.globalIndex
                            : e.index ?? '-'}
                        </td>
                        <td className="p-2">{e.name || '-'}</td>
                        <td className="p-2">{e.type || '-'}</td>
                        <td className="p-2 text-red-400">{e.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {result.errors.length > 200 && (
                  <p className="text-xs text-dryGray mt-2">
                    Showing first 200 errors. Download the full list for all
                    errors.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </SideBar>
  );
}
