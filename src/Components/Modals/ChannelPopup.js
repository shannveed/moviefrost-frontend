// Frontend/src/Components/Modals/ChannelPopup.js
import React from 'react';

export default function ChannelPopup({
  open,
  onClose,
  title,
  description,
  url,
  buttonText = 'Open',
  Icon,
}) {
  if (!open) return null;

  const handleOpen = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl bg-dry border border-border p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          {Icon ? (
            <div className="w-10 h-10 rounded-full bg-main border border-border flex items-center justify-center">
              <Icon className="text-customPurple text-xl" />
            </div>
          ) : null}

          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        {description ? (
          <p className="text-sm text-dryGray mb-4">{description}</p>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleOpen}
            className="w-full bg-customPurple hover:bg-opacity-90 transition text-white py-3 rounded-md font-semibold"
          >
            {buttonText}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full border border-border hover:bg-main transition text-white py-3 rounded-md"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
