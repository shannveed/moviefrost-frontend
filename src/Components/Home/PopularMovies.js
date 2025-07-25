// PopularMovies.js - Updated to use Monetag banner instead of Ezoic
import React from 'react';
import Titles from '../Titles';
import { BsCollectionFill } from 'react-icons/bs';
import Movie from '../movie';
import { Empty } from '../Notifications/Empty';
import Loader from '../Loader';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { MonetagBanner } from '../Ads/AdWrapper';
import { AD_CONFIG } from '../Ads/AdConfig';

function PopularMovies({ isLoading, movies }) {
  return (
    <div className="my-8 mobile:my-4">
      <div className="flex justify-between items-center mb-6 mobile:mb-4 mobile:px-4">
        <Titles title="Latest" Icon={BsCollectionFill} />
      </div>
      
      {isLoading ? (
        <Loader />
      ) : movies?.length > 0 ? (
        <>
          <div className="grid xl:grid-cols-5 above-1000:grid-cols-5 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-4 mobile:gap-0">
            {movies.slice(0, 5).map((movie) => (       
              <Movie key={movie._id} movie={movie} />
            ))}
          </div>
          
          {/* Monetag Banner in the middle of the grid (if enabled) */}
          {AD_CONFIG.monetag.banner.enabled && (
            <MonetagBanner 
              zoneId={AD_CONFIG.monetag.banner.zoneId}
              width={728}
              height={90}
              className="my-4"
            />
          )}
          
          <div className="grid xl:grid-cols-5 above-1000:grid-cols-5 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-4 mobile:gap-0">
            {movies.slice(5, 10).map((movie) => (       
              <Movie key={movie._id} movie={movie} />
            ))}
          </div>
          
          {/* Updated Show More Button - Centered and styled */}
          {movies?.length > 10 && (
            <div className="flex justify-center mt-8 mobile:mt-6">
              <Link 
                to="/movies" 
                className="group inline-flex items-center gap-2 bg-dry hover:bg-customPurple border-2 border-customPurple text-white transitions text-sm font-medium px-6 py-3 rounded-md"
              >
                <span>Show More</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6">
          <Empty message="It seems like we don't have any movies." />
        </div>
      )}
    </div>
  );
}

export default PopularMovies;
