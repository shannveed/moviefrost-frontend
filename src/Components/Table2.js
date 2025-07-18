// Table2.js
import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { DateFormat, shortUppercaseId } from './Notifications/Empty';

const Head =
  'text-xs above-1000:text-[11px] text-left text-main font-semibold px-6 above-1000:px-4 py-2 uppercase';
const Text =
  'text-sm above-1000:text-xs text-left leading-6 above-1000:leading-5 break-words px-5 above-1000:px-3 py-3 above-1000:py-2';     /*  << NO nowrap  */

// Rows
const Rows = (data, i, users, onEdit, onDeleteFunction) => (
  <tr key={i}>
    {users ? (
      <>
        {/*  Users table  */}
        <td className={Text}>
          <div className="w-12 h-12 overflow-hidden rounded border border-border bg-dry">
            <img
              src={data?.image || '/images/default-avatar.png'}   
              alt={data?.fullName || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
        </td>
        <td className={Text}>{shortUppercaseId(data?._id)}</td>
        <td className={Text}>{DateFormat(data?.createdAt)}</td>
        <td className={Text}>{data?.fullName}</td>
        <td className={Text}>{data?.email}</td>
        <td className={Text}>{data?.isAdmin ? 'Admin' : 'User'}</td>
        <td className={`${Text} flex justify-end gap-2`}>
          {!data.isAdmin && (
            <button
              onClick={() => onDeleteFunction(data?._id)}
              className="bg-customPurple text-white rounded w-6 h-6 flex items-center justify-center"
            >
              <MdDelete />
            </button>
          )}
        </td>
      </>
    ) : (
      /*  categories table  */
      <>
        <td className={Text}>{shortUppercaseId(data?._id)}</td>
        <td className={Text}>{DateFormat(data?.createdAt)}</td>
        <td className={Text}>{data?.title}</td>
        <td className={`${Text} flex justify-end gap-2`}>
          <button
            onClick={() => onEdit(data)}
            className="border border-border bg-dry flex gap-2 items-center text-border rounded py-1 px-2"
          >
            Edit <FaEdit className="text-green-500" />
          </button>
          <button
            onClick={() => onDeleteFunction(data?._id)}
            className="bg-customPurple text-white rounded w-6 h-6 flex items-center justify-center"
          >
            <MdDelete />
          </button>
        </td>
      </>
    )}
  </tr>
);

function Table2({ data, users, onEdit, onDeleteFunction }) {
  return (
    <div className="relative w-full overflow-hidden">
      <table className="w-full table-auto border border-border divide-y divide-border">
        <thead>
          <tr className="bg-dryGray">
            {users ? (
              <>
                {['Image', 'Id', 'Date', 'Full Name', 'Email', 'Role'].map(
                  (h) => (
                    <th key={h} scope="col" className={Head}>
                      {h}
                    </th>
                  ),
                )}
              </>
            ) : (
              <>
                {['Id', 'Date', 'Name'].map((h) => (
                  <th key={h} scope="col" className={Head}>
                    {h}
                  </th>
                ))}
              </>
            )}
            <th scope="col" className={`${Head} text-right`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-main divide-y divide-gray-800">
          {data.map((d, i) =>
            Rows(d, i, users, onEdit, onDeleteFunction),
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table2;
