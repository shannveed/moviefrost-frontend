


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
    <article className="border border-border mobile:border-2 p-2 mobile:p-0 mobile:mb-4 hover:scale-95 transitions relative rounded mobile:rounded-none overflow-hidden group">
      {/* Thumbnail info */}
      {movie?.thumbnailInfo && (
        <div className="absolute top-2 left-2 bg-customPurple text-white text-xs above-1000:text-[10px] px-2 py-0.5 rounded font-semibold z-10">
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
          className="w-full h-80 above-1000:h-[calc(100vw/5*1.3)] mobile:h-[calc(100vw*1.519)] object-cover rounded-md mobile:rounded-none"
        />
      </button>

      <div className="absolute flex-btn gap-2 bottom-0 right-0 left-0 bg-main bg-opacity-60 text-white px-4 mobile:px-2 py-3 mobile:py-2 items-end">
        {/* Movie name */}
        <h3
          className="font-semibold text-white text-sm above-1000:text-xs mobile:text-xs line-clamp-2 flex-grow mr-2"
          title={movie?.name}
        >
          {movie?.name}
        </h3>
        {/* Like button */}
        <button
          onClick={handleLikeClick}
          disabled={isLiked || isLoading}
          aria-label={isLiked ? `Remove ${movie?.name} from favorites` : `Add ${movie?.name} to favorites`}
          className={`h-9 w-9 above-1000:h-7 above-1000:w-7 mobile:h-7 mobile:w-7 text-sm above-1000:text-xs mobile:text-xs flex-colo transitions ${
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

