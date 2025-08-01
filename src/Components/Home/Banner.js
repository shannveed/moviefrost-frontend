// Banner.js  <-- UPDATED
import React, { memo, useCallback } from 'react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import FlexMovieItems from '../FlexMovieItems';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Loader from '../Loader';
import { RiMovie2Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { IfMovieLiked, LikeMovie } from '../../Context/Functionalities';
import OptimizedImage from '../OptimizedImage';

const SwiperComponent = memo(({ sameClass, movies }) => {
  const { isLoading } = useSelector((state) => state.userLikeMovie);
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userLogin);

  const isLiked = useCallback((movie) => IfMovieLiked(movie), []);

  const handleLikeMovie = useCallback(
    (movie) => {
      LikeMovie(movie, dispatch, userInfo);
    },
    [dispatch, userInfo]
  );

  return (
    <Swiper
      direction="vertical"
      slidesPerView={1}
      loop
      speed={1000}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      modules={[Autoplay]}
      className={sameClass}
    >
      {movies?.slice(0, 8).map((movie, index) => (
        <SwiperSlide
          key={movie._id || index}
          className="relative rounded overflow-hidden"
        >
          <OptimizedImage
            src={movie?.image || '/images/c1.jpg'}
            alt={movie?.name || 'Movie banner'}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute linear-bg xl:pl-52 sm:pl-32 pl-8 top-0 bottom-0 right-0 left-0 flex flex-col justify-center lg:gap-8 md:gap-5 gap-4">
            <h1 className="xl:text-4xl truncate capitalize font-sans sm:text-xl text-lg font-bold">
              {movie?.name}
            </h1>
            <div className="flex gap-5 items-center text-dryGray">
              <FlexMovieItems movie={movie} />
            </div>
            <div className="flex gap-5 items-center">
              <Link
                to={`/movie/${movie?._id}`}
                className="bg-customPurple hover:text-main transitions text-white px-8 py-2 rounded font sm:text-sm text-xs"
                aria-label={`Watch ${movie?.name}`}
              >
                Watch
              </Link>
              <button
                onClick={() => handleLikeMovie(movie)}
                disabled={isLiked(movie) || isLoading}
                aria-label={
                  isLiked(movie)
                    ? `Remove ${movie?.name} from favorites`
                    : `Add ${movie?.name} to favorites`
                }
                className={`bg-white ${
                  isLiked(movie) ? 'text-customPurple' : 'text-white'
                } hover:text-customPurple transitions px-4 py-3 rounded text-sm bg-opacity-30`}
              >
                <FaHeart aria-hidden="true" />
              </button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
});
SwiperComponent.displayName = 'SwiperComponent';

function Banner({ movies = [], isLoading = false }) {
  const sameClass = 'w-full flex-colo xl:h-[530px] bg-dry lg:h-96 h-80';

  return (
    <section className="relative w-full" aria-label="Featured movies">
      {isLoading ? (
        <div className={sameClass}>
          <Loader />
        </div>
      ) : movies?.length > 0 ? (
        <SwiperComponent sameClass={sameClass} movies={movies} />
      ) : (
        <div className={sameClass}>
          <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-customPurple text-4xl">
            <RiMovie2Line aria-hidden="true" />
          </div>
          <p className="text-border text-sm">
            It seems like we don't have any movies
          </p>
        </div>
      )}
    </section>
  );
}

export default memo(Banner);
