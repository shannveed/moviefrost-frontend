import React from 'react';
import {
  FaFacebookF,
  FaTelegramPlane,
  FaEnvelope,
  FaPinterestP,
  FaWhatsapp,
  FaTwitter,
} from 'react-icons/fa';

const ShareMovieModal = ({ modalOpen, setModalOpen, movie }) => {
  const shareUrl = window.location.href;
  const shareMessage = `Check out "${movie?.name}" on MoviSphere!`;

  const shareLinks = [
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`,
      icon: FaFacebookF,
      label: 'Facebook',
    },
    {
      href: `https://telegram.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`,
      icon: FaTelegramPlane,
      label: 'Telegram',
    },
    {
      href: `mailto:?subject=${encodeURIComponent('Check out this movie')}&body=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`,
      icon: FaEnvelope,
      label: 'Email',
    },
    {
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareMessage)}`,
      icon: FaPinterestP,
      label: 'Pinterest',
    },
    {
      href: `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`,
      icon: FaWhatsapp,
      label: 'WhatsApp',
    },
    {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`,
      icon: FaTwitter,
      label: 'Twitter',
    },
  ];

  return (
    modalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="relative inline-block sm:w-4/5 md:w-3/5 lg:w-2/5 w-full align-middle rounded-lg p-10 text-white bg-gray-800 border border-border">
          <h2 className="text-xl text-center">
            Share <span className="text-xl font-bold">"{movie?.name || 'this movie'}"</span>
          </h2>
          <div className="flex flex-wrap gap-6 mt-6 justify-center">
            {shareLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform transform hover:scale-105"
                >
                  <div className="w-12 h-12 transitions hover:bg-customPurple flex items-center justify-center text-lg bg-white rounded bg-opacity-30">
                    <Icon />
                  </div>
                </a>
              );
            })}
          </div>
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white text-2xl focus:outline-none"
            onClick={() => setModalOpen(false)}
          >
            &times;
          </button>
        </div>
      </div>
    )
  );
};

export default ShareMovieModal;
