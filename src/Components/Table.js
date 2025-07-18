import React, { memo } from 'react';
import { FaCloudDownloadAlt, FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { GoEye } from 'react-icons/go';
import { formatTime } from '../Context/Functionalities';
import OptimizedImage from './OptimizedImage';

// Head / cell helpers
const Head = 'text-xs above-1000:text-[11px] mobile:text-[10px] text-left text-main font-semibold px-6 above-1000:px-4 mobile:px-2 py-2 mobile:py-1 uppercase';
const Text = 'text-sm above-1000:text-xs mobile:text-[11px] text-left leading-6 above-1000:leading-5 mobile:leading-4 break-words px-5 above-1000:px-3 mobile:px-2 py-3 above-1000:py-2 mobile:py-1.5';

// Mobile card component for responsive display
const MobileCard = memo(({ movie, admin, downloadVideo, onDeleteHandler, progress }) => (
  <article className="bg-dry border border-border rounded-lg p-4 mb-3">
    <div className="flex items-start gap-3">
      <div className="w-20 h-20 flex-shrink-0">
        <OptimizedImage
          className="w-full h-full object-cover rounded"
          src={movie?.titleImage ?? '/images/default.jpg'}
          alt={`${movie?.name} poster`}
          width={80}
          height={80}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{movie.name}</h3>
        <p className="text-xs text-text mb-1">{movie.category}</p>
        <p className="text-xs text-text">{movie.year} • {formatTime(movie.time)}</p>
      </div>
    </div>
    
    <div className="flex gap-2 mt-3">
      {admin ? (
        <>
          <Link
            to={`/edit/${movie?._id}`}
            className="flex-1 border border-border bg-dry flex gap-1 items-center justify-center text-xs rounded py-2"
            aria-label={`Edit ${movie?.name}`}
          >
            Edit <FaEdit className="text-green-500 text-sm" aria-hidden="true" />
          </Link>
          <button
            onClick={() => onDeleteHandler(movie?._id)}
            className="bg-customPurple text-white rounded px-4 py-2 flex items-center justify-center"
            aria-label={`Delete ${movie?.name}`}
          >
            <MdDelete className="text-sm" aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => downloadVideo(movie?.downloadUrl, movie?.name)}
            disabled={progress > 0 && progress < 100}
            className="flex-1 border border-border bg-dry flex gap-1 items-center justify-center text-xs rounded py-2"
            aria-label={`Download ${movie?.name}`}
          >
            Download <FaCloudDownloadAlt className="text-green-500 text-sm" aria-hidden="true" />
          </button>
          <Link
            to={`/movie/${movie?._id}`}
            className="bg-customPurple text-white rounded px-4 py-2 flex items-center justify-center"
            aria-label={`View ${movie?.name} details`}
          >
            <GoEye className="text-sm" aria-hidden="true" />
          </Link>
        </>
      )}
    </div>
  </article>
));

MobileCard.displayName = 'MobileCard';

// Desktop row
const Row = memo(({ movie, index, onDeleteHandler, admin, downloadVideo, progress }) => (
  <tr key={movie._id}>
    <td className={Text}>
      <div className="w-12 p-1 bg-dry border border-border h-12 rounded overflow-hidden mobile:w-10 mobile:h-10">
        <OptimizedImage
          className="h-full w-full object-cover"
          src={movie?.titleImage ?? '/images/default.jpg'}
          alt={`${movie?.name} poster`}
          width={48}
          height={48}
        />
      </div>
    </td>
    <td className={`${Text} max-w-[220px] mobile:max-w-[120px]`}>
      <span className="mobile:line-clamp-2">{movie.name}</span>
    </td>
    <td className={`${Text} mobile:hidden`}>{movie.category}</td>
    <td className={`${Text} mobile:hidden`}>{movie.browseBy}</td>
    <td className={`${Text} mobile:hidden`}>{movie.language}</td>
    <td className={Text}>{movie.year}</td>
    <td className={`${Text} mobile:hidden`}>{formatTime(movie.time)}</td>

    <td className={`${Text} flex gap-2 justify-end`}>
      {admin ? (
        <>
          <Link
            to={`/edit/${movie?._id}`}
            className="border border-border bg-dry flex gap-2 items-center text-border rounded py-1 px-2 mobile:hidden"
            aria-label={`Edit ${movie?.name}`}
          >
            Edit <FaEdit className="text-green-500" aria-hidden="true" />
          </Link>
          <button
            onClick={() => onDeleteHandler(movie?._id)}
            className="bg-customPurple text-white rounded w-6 h-6 flex items-center justify-center"
            aria-label={`Delete ${movie?.name}`}
          >
            <MdDelete aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => downloadVideo(movie?.downloadUrl, movie?.name)}
            disabled={progress > 0 && progress < 100}
            className="border border-border bg-dry flex gap-2 items-center text-white/60 rounded py-1 px-2 mobile:hidden"
            aria-label={`Download ${movie?.name}`}
          >
            Download <FaCloudDownloadAlt className="text-green-500" aria-hidden="true" />
          </button>
          <Link
            to={`/movie/${movie?._id}`}
            className="bg-customPurple text-white rounded w-6 h-6 flex items-center justify-center"
            aria-label={`View ${movie?.name} details`}
          >
            <GoEye aria-hidden="true" />
          </Link>
        </>
      )}
    </td>
  </tr>
));

Row.displayName = 'Row';

// Table component
function Table({ data, admin, onDeleteHandler, downloadVideo, progress }) {
  return (
    <>
      {/* Mobile View - Cards */}
      <div className="sm:hidden" role="list" aria-label="Movies list">
        {data.map((movie) => (
          <MobileCard
            key={movie._id}
            movie={movie}
            admin={admin}
            downloadVideo={downloadVideo}
            onDeleteHandler={onDeleteHandler}
            progress={progress}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block relative w-full overflow-hidden">
        <table className="w-full table-auto border border-border divide-y divide-border" role="table">
          <caption className="sr-only">Movies list table</caption>
          <thead>
            <tr className="bg-dryGray">
              <th scope="col" className={Head}>
                Image
              </th>
              <th scope="col" className={Head}>
                Name
              </th>
              <th scope="col" className={`${Head} mobile:hidden`}>
                Category
              </th>
              <th scope="col" className={`${Head} mobile:hidden`}>
                Browse By
              </th>
              <th scope="col" className={`${Head} mobile:hidden`}>
                Language
              </th>
              <th scope="col" className={Head}>
                Year
              </th>
              <th scope="col" className={`${Head} mobile:hidden`}>
                Duration
              </th>
              <th scope="col" className={`${Head} text-right pr-8`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-main divide-y divide-gray-800">
            {data.map((movie, index) => (
              <Row
                key={movie._id}
                movie={movie}
                index={index}
                onDeleteHandler={onDeleteHandler}
                admin={admin}
                downloadVideo={downloadVideo}
                progress={progress}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default memo(Table);
