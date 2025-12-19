import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Axios from '../../Redux/APIs/Axios';
import { requestPermissionAndSubscribe } from '../../utils/pushNotifications';

const PENDING_KEY = 'pendingWatchRequest';

export default function MovieRequestPopup({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.userLogin || {});

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (trimmed.length < 2) {
      toast.error('Please enter a movie/web series name');
      return;
    }

    // If not logged in -> save and redirect
    if (!userInfo?.token) {
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ title: trimmed, ts: Date.now() })
      );

      toast.error(
        'Please login so you receive the watch link on your notification bell icon.'
      );

      onClose?.();
      navigate('/login');
      return;
    }

    try {
      setSending(true);

      await Axios.post(
        '/requests',
        { title: trimmed },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Ask push permission (user gesture = submit)
      try {
        await requestPermissionAndSubscribe(userInfo.token);
      } catch {
        // ignore push failures; request still sent
      }

      toast.success(
        'Request sent to admin. You will get the watch link in your notification bell when admin replies.'
      );
      setTitle('');
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to send request'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl bg-dry border border-border p-5 text-white">
        <h3 className="text-lg font-semibold mb-2">What do you want to watch?</h3>
        <p className="text-sm text-dryGray mb-4">
          Tell us the movie/web series name. Admin will send you the link.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Avengers Endgame / Money Heist"
            className="w-full bg-main border border-border rounded-md px-3 py-3 text-sm outline-none focus:border-customPurple"
          />

          <button
            disabled={sending}
            type="submit"
            className="w-full bg-customPurple hover:bg-opacity-90 transition text-white py-3 rounded-md font-semibold"
          >
            {sending ? 'Sending...' : 'Submit'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full border border-border hover:bg-main transition text-white py-3 rounded-md"
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
}
