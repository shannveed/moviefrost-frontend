// Frontend/src/Components/Single/MovieInfo.js
import React from 'react';
import { FaCalendarAlt, FaFolder, FaRegClock } from 'react-icons/fa';
import { FaPlay, FaShareAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import Rating from '../Stars';
import { formatTime } from '../../Context/Functionalities';
import { BiArrowBack } from 'react-icons/bi';

function MovieInfo({ movie, setModalOpen, DownloadVideo, onBackClick }) {
  // Use slug if available, fallback to _id
  const watchPathSegment = movie?.slug || movie?._id;

  return (
    <div className="w-full xl:h-screen relative text-white">
      <img
        src={movie?.image ? movie?.image : '/images/c3.jpg'}
        alt={movie?.name}
        className="w-full hidden xl:inline-block h-full object-cover"
      />
      <div className="xl:bg-main bg-dry flex-colo xl:bg-opacity-90 xl:absolute top-0 left-0 right-0 bottom-0">
        <div className="container px-8 mobile:px-4 mx-auto 2xl:px-32 xl:grid grid-cols-3 flex-colo py-10 lg:py-20 gap-8">
          {/* Back button for mobile/tablet */}
          <div className="xl:hidden w-full">
            <button
              onClick={onBackClick || (() => window.history.back())}
              className="flex items-center gap-2 text-dryGray hover:text-white transitions mb-4"
            >
              <BiArrowBack className="text-xl" />
              <span>Back to Movies</span>
            </button>
          </div>
          
          {/* Image section */}
          <div className="xl:col-span-1 w-full xl:order-none order-last xl:h-header bg-dry border border-gray-800 rounded-lg overflow-hidden">
            <img
              src={movie?.titleImage ? movie?.titleImage : '/images/c3.jpg'}
              alt={movie?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-2 col-span-2 md:grid grid-cols-5 gap-4 items-center">
            <div className="col-span-3 flex flex-col gap-10 above-1000:gap-6">
              {/* Title */}
              <h1 className="xl:text-4xl above-1000:text-3xl capitalize font-sans text-xl font-bold">
                {movie?.name}
              </h1>
              {/* Flex items */}
              <div className="flex items-center gap-4 font-medium text-dryGray">
                <div className="flex-col bg-customPurple text-xs px-2 py-1">
                  HD 4K
                </div>
                <div className="flex items-center gap-1">
                  <FaRegClock className="text-subMain w-3 h-3" />
                  <p className="text-sm above-1000:text-xs">{formatTime(movie?.time)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="text-subMain w-3 h-3" />
                  <p className="text-sm above-1000:text-xs">{movie?.year}</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaFolder className="text-subMain w-3 h-3" />
                  <p className="text-sm above-1000:text-xs">{movie?.category}</p>
                </div>
              </div>
              {/* Description */}
              <p className="text-text text-sm above-1000:text-xs above-1000:leading-6 leading-7">{movie?.desc}</p>
              {/* Grid */}
              <div className="grid sm:grid-cols-5 grid-cols-3 gap-4 p-6 above-1000:p-4 bg-main border border-gray-800 rounded-lg">
                {/* Share */}
                <div className="col-span-1 flex-colo border-r border-border">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-10 h-10 above-1000:w-8 above-1000:h-8 hover:bg-customPurple flex-colo rounded-lg bg-white bg-opacity-20"
                  >
                    <FaShareAlt className="above-1000:text-sm" />
                  </button>
                </div>
                {/* Language */}
                <div className="col-span-2 flex-colo font-medium text-sm above-1000:text-xs">
                  <p>
                    Language :{' '}
                    <span className="ml-2 truncate">{movie?.language}</span>
                  </p>
                </div>
                {/* Watch button */}
                <div className="sm:col-span-2 col-span-3 flex justify-end font-medium text-sm above-1000:text-xs">
                  <Link
                    to={`/watch/${watchPathSegment}`}
                    className="bg-dry py-4 above-1000:py-3 hover:bg-customPurple transitions border-2 border-customPurple rounded-full flex-rows gap-4 w-full sm:py-3"
                  >
                    <FaPlay className="w-3 h-3 above-1000:w-2.5 above-1000:h-2.5" />
                    Watch
                  </Link>
                </div>
              </div>
              {/* Ratings */}
              <div className="flex mb-6 above-1000:mb-4 text-lg above-1000:text-base gap-2 text-star">
                <Rating value={movie?.rate} />
              </div>
            </div>
            {/* Download button */}
            <div className="col-span-1 ml-4 md:mt-0 mt-2 flex justify-end">
              <button
                onClick={() => DownloadVideo(movie?.downloadUrl)}
                className="md:w-1/4 above-1000:w-1/3 w-full relative flex-colo bg-customPurple hover:bg-transparent border-2 border-customPurple transitions 
                h-16 md:h-64 above-1000:h-48 sm:h-14 rounded font-medium"
              >
                <div 
                  className="flex-rows gap-6 above-1000:gap-4 text-md above-1000:text-sm uppercase tracking-widest absolute md:rotate-90">
                  Download <FiLogIn className="w-6 h-6 above-1000:w-5 above-1000:h-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieInfo;
