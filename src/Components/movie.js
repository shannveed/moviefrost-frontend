// Frontend/src/Components/movie.js
import React, { memo, useCallback, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { TbChevronDown } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { IfMovieLiked, LikeMovie } from '../Context/Functionalities';
import { useDispatch, useSelector } from 'react-redux';
import OptimizedImage from './OptimizedImage';

const Movie = memo(
  ({
    movie,
    // Admin ordering props (all optional; only used for admin)
    showAdminControls = false,
    isSelected = false,
    onSelectToggle,
    totalPages,
    onMoveToPageClick,
    adminDraggable = false,
    onAdminDragStart,
    onAdminDragEnter,
    onAdminDragEnd,
  }) => {
    const { isLoading } = useSelector((state) => state.userLikeMovie);
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.userLogin);
    const navigate = useNavigate();
    const [showPageDropdown, setShowPageDropdown] = useState(false);

    const isLiked = IfMovieLiked(movie);

    const handleMovieClick = useCallback(
      (e) => {
        e.preventDefault();

        // Save current scroll position and page state before navigating
        const currentState = sessionStorage.getItem('moviesPageState');
        if (currentState) {
          try {
            const state = JSON.parse(currentState);
            state.scrollPosition = window.scrollY;
            state.timestamp = Date.now();
            sessionStorage.setItem('moviesPageState', JSON.stringify(state));
          } catch {
            // Ignore errors
          }
        }

        // Use slug if available, fallback to _id
        const pathSegment = movie?.slug || movie?._id;
        navigate(`/movie/${pathSegment}`, { state: { fromMoviesPage: true } });
      },
      [navigate, movie]
    );

    const handleLikeClick = useCallback(
      (e) => {
        e.stopPropagation();
        LikeMovie(movie, dispatch, userInfo);
      },
      [movie, dispatch, userInfo]
    );

    const handleCheckboxChange = (e) => {
      e.stopPropagation();
      if (onSelectToggle) {
        onSelectToggle(movie._id);
      }
    };

    const handleMovePageClick = (e, page) => {
      e.stopPropagation();
      setShowPageDropdown(false);
      if (onMoveToPageClick) {
        onMoveToPageClick(movie._id, page);
      }
    };

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setShowPageDropdown((prev) => !prev);
    };

    return (
      <article
        className={`border border-border mobile:border-1 p-2 mobile:p-1 mobile:mb-0 hover:scale-95 transitions relative rounded mobile:rounded-md overflow-hidden group ${
          adminDraggable ? 'cursor-grab active:cursor-grabbing' : ''
        } ${isSelected ? 'ring-2 ring-customPurple' : ''}`}
        draggable={adminDraggable}
        onDragStart={
          adminDraggable
            ? (e) => onAdminDragStart && onAdminDragStart(e, movie._id)
            : undefined
        }
        onDragEnter={
          adminDraggable
            ? (e) => onAdminDragEnter && onAdminDragEnter(e, movie._id)
            : undefined
        }
        onDragEnd={adminDraggable ? (e) => onAdminDragEnd && onAdminDragEnd(e) : undefined}
        onDragOver={adminDraggable ? (e) => e.preventDefault() : undefined}
      >
        {/* Admin-only controls in top-right */}
        {showAdminControls && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 accent-customPurple cursor-pointer"
              title="Select for bulk action"
            />
            {typeof totalPages === 'number' && totalPages > 1 && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="w-6 h-6 flex items-center justify-center bg-main/80 hover:bg-customPurple rounded text-white text-xs"
                  title="Move to page"
                >
                  <TbChevronDown className={`transition-transform ${showPageDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showPageDropdown && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-dry border border-border rounded shadow-lg max-h-48 overflow-y-auto z-30 min-w-[80px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => handleMovePageClick(e, idx + 1)}
                        className="block w-full text-left text-xs px-3 py-2 hover:bg-customPurple text-white transitions"
                      >
                        Page {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Thumbnail info */}
        {movie?.thumbnailInfo && (
          <div className="absolute top-2 left-2 bg-customPurple text-white text-xs above-1000:text-[10px] mobile:text-[11px] px-2 mobile:px-1.5 py-0.5 mobile:py-0.5 rounded font-semibold z-10">
            {movie.thumbnailInfo}
          </div>
        )}

        <button
          onClick={handleMovieClick}
          className="w-full block cursor-pointer"
          aria-label={`View details for ${movie?.name}`}
        >
          <OptimizedImage
            src={movie?.titleImage || '/images/c3.jpg'}
            alt={movie?.name || 'Movie poster'}
            width={300}
            height={450}
            className="w-full h-80 above-1000:h-[calc(100vw/5*1.3)] mobile:h-[calc((100vw-2rem-0.5rem)/2*1.54)] object-cover rounded-sm"
          />
        </button>

        <div className="absolute flex-btn gap-2 bottom-0 right-0 left-0 bg-main bg-opacity-60 text-white px-4 mobile:px-1 py-2 mobile:py-2 items-end">
          {/* Movie name */}
          <h3
            className="font-semibold text-white text-sm above-1000:text-xs mobile:text-[11px] line-clamp-2 flex-grow mr-2"
            title={movie?.name}
          >
            {movie?.name}
          </h3>
          {/* Like button – hidden on mobiles */}
          <button
            onClick={handleLikeClick}
            disabled={isLiked || isLoading}
            aria-label={isLiked ? `Remove ${movie?.name} from favorites` : `Add ${movie?.name} to favorites`}
            className={`mobile:hidden h-9 w-9 above-1000:h-7 above-1000:w-7 text-sm above-1000:text-xs flex-colo transitions ${
              isLiked ? 'bg-transparent' : 'bg-customPurple'
            } hover:bg-transparent border-2 border-customPurple rounded-md text-white flex-shrink-0`}
          >
            <FaHeart aria-hidden="true" />
          </button>
        </div>
      </article>
    );
  }
);

Movie.displayName = 'Movie';

export default Movie;
