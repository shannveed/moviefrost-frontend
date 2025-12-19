import React, { useEffect, useMemo, useState } from 'react';
import SideBar from '../SideBar';
import Uploader from '../../../Components/Uploader';
import Axios from '../../../Redux/APIs/Axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsersAction } from '../../../Redux/Actions/userActions';

export default function PushNotification() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userLogin || {});
  const { users = [], isLoading } = useSelector((state) => state.adminGetAllUsers || {});

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(getAllUsersAction());
  }, [dispatch]);

  const userList = useMemo(
    () => (Array.isArray(users) ? users.filter((u) => !u.isAdmin) : []),
    [users]
  );

  const toggleUser = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => setSelected(userList.map((u) => u._id));
  const clearAll = () => setSelected([]);

  const handleSend = async () => {
    if (!title.trim()) return toast.error('Title is required');
    if (selected.length === 0) return toast.error('Select at least one user');

    try {
      setSending(true);

      await Axios.post(
        '/push-campaigns',
        {
          title: title.trim(),
          message: message.trim(),
          link: link.trim(),
          imageUrl,
          userIds: selected,
          sendEmail: true,
          sendPush: true,
          sendInApp: true,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      toast.success('Notification campaign sent');
      setTitle('');
      setMessage('');
      setLink('');
      setImageUrl('');
      setSelected([]);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <SideBar>
      <div className="text-white flex flex-col gap-6">
        <h2 className="text-xl font-bold">Push Notification</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-border">Movie Heading</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-main border border-border rounded px-3 py-3 mt-2"
              placeholder="e.g. New Movie Added: Gladiator 2"
            />
          </div>

          <div>
            <label className="text-sm text-border">Movie Link</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-main border border-border rounded px-3 py-3 mt-2"
              placeholder="https://www.moviefrost.com/movie/slug"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-border">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-main border border-border rounded px-3 py-3 mt-2 min-h-[110px]"
              placeholder="Short description..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-border">Thumbnail Image (R2 Upload)</label>
            <div className="mt-2">
              <Uploader setImageUrl={setImageUrl} />
            </div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="thumbnail"
                className="mt-3 w-48 h-28 object-cover rounded border border-border"
              />
            )}
          </div>
        </div>

        <div className="bg-dry border border-border rounded p-4">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
            <h3 className="font-semibold">Select Users ({selected.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-2 text-xs border border-customPurple rounded hover:bg-customPurple"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-2 text-xs border border-border rounded hover:bg-main"
              >
                Clear
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-border">Loading users...</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
              {userList.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-main cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(u._id)}
                    onChange={() => toggleUser(u._id)}
                    className="accent-customPurple"
                  />
                  <span className="text-sm">{u.fullName}</span>
                  <span className="text-xs text-border ml-auto">{u.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-customPurple hover:bg-opacity-90 transition text-white py-3 rounded font-semibold"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </SideBar>
  );
}
