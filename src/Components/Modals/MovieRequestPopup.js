import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Axios from '../../Redux/APIs/Axios';
import {
  ensurePushSubscription,
  isPushSupported,
  requestPermissionAndSubscribe,
} from '../../utils/pushNotifications';

const PENDING_KEY = 'pendingWatchRequest';

// show the "turn on notifications" alert only once per session
const NOTIF_HINT_KEY = 'watchRequestNotifHintShown';

export default function MovieRequestPopup({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [enablingNotif, setEnablingNotif] = useState(false);

  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.userLogin || {});
  const isLoggedIn = !!userInfo?.token;

  const pushSupported = useMemo(() => isPushSupported(), []);
  const notificationsEnabled = pushSupported && permission === 'granted';

  // Refresh permission every time popup opens (user may have changed browser settings)
  useEffect(() => {
    if (!open) return;
    setPermission(
      typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
  }, [open]);

  // If logged in but notifications are not enabled → show alert once
  useEffect(() => {
    if (!open) return;
    if (!isLoggedIn) return;
    if (!pushSupported) return;

    // If already granted, silently ensure subscription exists
    if (permission === 'granted') {
      ensurePushSubscription(userInfo.token).catch(() => {});
      return;
    }

    try {
      if (!sessionStorage.getItem(NOTIF_HINT_KEY)) {
        sessionStorage.setItem(NOTIF_HINT_KEY, '1');
        toast.error(
          'Please turn on notifications so admin replies show on your device screen.'
        );
      }
    } catch {
      toast.error(
        'Please turn on notifications so admin replies show on your device screen.'
      );
    }
  }, [open, isLoggedIn, pushSupported, permission, userInfo?.token]);

  if (!open) return null;

  const savePending = (t) => {
    try {
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ title: t, ts: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  // NEW: login button handler (also preserves typed title if present)
  const handleLoginClick = () => {
    const trimmed = title.trim();
    if (trimmed.length >= 2) savePending(trimmed);

    toast.error(
      'Please login and turn on the notification so When admin send you the link so you can watch your favourite movie or webseries.'
    );
    onClose?.();
    navigate('/login');
  };

  // NEW: allow logged-in users to enable notifications from popup
  const handleEnableNotifications = async () => {
    if (!isLoggedIn) {
      handleLoginClick();
      return;
    }

    if (!pushSupported) {
      toast.error(
        'Push notifications are not supported in this browser. You will still receive replies in the notification bell icon.'
      );
      return;
    }

    try {
      setEnablingNotif(true);

      const res = await requestPermissionAndSubscribe(userInfo.token);
      const nextPerm =
        res?.permission ||
        (typeof Notification !== 'undefined'
          ? Notification.permission
          : 'default');

      setPermission(nextPerm);

      if (res?.subscribed) {
        toast.success(
          'Notifications enabled. Admin replies will also appear on your device screen.'
        );
      } else if (res?.permission === 'denied') {
        toast.error(
          'Notifications are blocked in your browser settings. Please allow notifications for MovieFrost.'
        );
      } else {
        toast(
          'Notifications not enabled. You can still check the notification bell icon.'
        );
      }
    } catch (err) {
      console.warn('[push] enable failed:', err);
      toast.error('Failed to enable notifications. Please try again.');
    } finally {
      setEnablingNotif(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (trimmed.length < 2) {
      toast.error('Please enter a valid movie/web series name');
      return;
    }

    // Not logged in → save and redirect
    if (!isLoggedIn) {
      savePending(trimmed);

      toast.error(
        'Please login and turn on the notification so When admin send you the link so you can watch your favourite movie or webseries.'
      );

      onClose?.();
      navigate('/login');
      return;
    }

    try {
      setSending(true);

      // Send request
      await Axios.post(
        '/requests',
        { title: trimmed },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Best-effort push subscribe (keeps your old behavior)
      try {
        const pushRes = await requestPermissionAndSubscribe(userInfo.token);
        const nextPerm =
          pushRes?.permission ||
          (typeof Notification !== 'undefined'
            ? Notification.permission
            : 'default');

        setPermission(nextPerm);

        if (pushRes?.supported && !pushRes?.subscribed) {
          if (pushRes.permission === 'denied') {
            toast.error(
              'Notifications are blocked. Enable them in browser settings to receive admin replies on your screen.'
            );
          } else {
            toast(
              'Turn on notifications to receive admin reply on your device screen.'
            );
          }
        }
      } catch (err) {
        console.warn('[push] subscribe failed:', err);
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

        <p className="text-sm text-dryGray mb-2">
          Tell us the movie/web series name. Admin will send you the link.
        </p>

        {/* NEW: requested line (shown for guests) */}
        {!isLoggedIn ? (
          <p className="text-xs text-dryGray mb-4">
            Please login and turn on the notification so When admin send you the
            link you can watch your favourite movie or webseries.
          </p>
        ) : (
          <div className="mb-4 rounded-md border border-border bg-main p-3 text-xs text-dryGray">
            {pushSupported ? (
              notificationsEnabled ? (
                <p className="text-green-400">
                  Notifications are ON. Admin replies will appear on your device
                  screen.
                </p>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1">
                    Notifications are OFF. Turn them on to receive admin replies
                    on your device screen.
                  </p>
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={enablingNotif}
                    className="shrink-0 bg-customPurple hover:bg-opacity-90 transition text-white px-3 py-2 rounded-md font-semibold disabled:opacity-60"
                  >
                    {enablingNotif ? 'Enabling...' : 'Turn On'}
                  </button>
                </div>
              )
            ) : (
              <p>
                Push notifications are not supported in this browser. You will
                still receive replies in the notification bell icon.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Avengers Endgame / Money Heist"
            className="w-full bg-main border border-border rounded-md px-3 py-3 text-sm outline-none focus:border-customPurple"
          />

          {/* Submit + Login (guest only) */}
          <div
            className={`grid gap-3 ${isLoggedIn ? 'grid-cols-1' : 'grid-cols-2'}`}
          >
            <button
              disabled={sending}
              type="submit"
              className="w-full bg-customPurple hover:bg-opacity-90 transition text-white py-3 rounded-md font-semibold disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Submit'}
            </button>

            {/* NEW: login button only for guests */}
            {!isLoggedIn && (
              <button
                type="button"
                onClick={handleLoginClick}
                className="w-full border border-customPurple text-customPurple hover:bg-customPurple hover:text-white transition py-3 rounded-md font-semibold"
              >
                Login
              </button>
            )}
          </div>

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
