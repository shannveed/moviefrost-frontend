// FlexMovieItems.js
import React from 'react';
import { FaRegClock, FaCalendarAlt, FaFolder } from 'react-icons/fa';
import { formatTime } from '../Context/Functionalities';

function FlexMovieItems({ movie, ...props }) {
  return (
    <div className={`flex items-center gap-2 ${props.className}`}>
      <div className="flex items-center gap-1">
        <FaRegClock className="text-subMain w-3 h-3" />
        <p className="text-sm">{formatTime(movie?.time)}</p>
      </div>
      <div className="flex items-center gap-1">
        <FaCalendarAlt className="text-subMain w-3 h-3" />
        <p className="text-sm">{movie?.year}</p>
      </div>
      <div className="flex items-center gap-1">
        <FaFolder className="text-subMain w-3 h-3" />
        <p className="text-sm">{movie?.category}</p>
      </div>
    </div>
  );
}

export default FlexMovieItems;
