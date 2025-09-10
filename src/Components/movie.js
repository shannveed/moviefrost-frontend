import React, { memo } from 'react';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { IfMovieLiked, LikeMovie } from '../Context/Functionalities';
import { useDispatch, useSelector } from 'react-redux';
import OptimizedImage from './OptimizedImage';

const Movie = memo(({ movie }) => {
  const { isLoading } = useSelector((state) => state.userLikeMovie);
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userLogin);
  const navigate = useNavigate();

  const isLiked = IfMovieLiked(movie);

  const handleMovieClick = (e) => {
    e.preventDefault();
    navigate(`/movie/${movie?._id}`, { state: { fromMoviesPage: true } });
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    LikeMovie(movie, dispatch, userInfo);
  };

  return (
    <article className="border border-border mobile:border-1 p-2 mobile:p-1 mobile:mb-0 hover:scale-95 transitions relative rounded mobile:rounded-md overflow-hidden group">
      {/* Thumbnail info - Updated with smaller mobile styles */}
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
          className="w-full h-80 above-1000:h-[calc(100vw/5*1.3)] mobile:h-[calc((100vw-2rem-0.5rem)/2*1.54)] object-cover rounded-sm "
        />
      </button>

      <div className="absolute flex-btn gap-2 bottom-0 right-0 left-0 bg-main bg-opacity-60 text-white px-4 mobile:px-1 py-2 mobile:py-2 items-end">
        {/* Movie name - Updated with smaller mobile text */}
        <h3
          className="font-semibold text-white text-sm above-1000:text-xs mobile:text-[11px] line-clamp-2 flex-grow mr-2"
          title={movie?.name}
        >
          {movie?.name}
        </h3>
        {/* Like button – hidden on mobiles (mobile:hidden), visible on ≥ 640 px (tablet / desktop) */}
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
});

Movie.displayName = 'Movie';

export default Movie;
