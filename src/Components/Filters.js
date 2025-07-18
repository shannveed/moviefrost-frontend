// Filters.js
import React, { useState, useEffect, useRef } from 'react';
import { FaAngleDown, FaCheck } from 'react-icons/fa';
import {
  LanguageData,
  RatesData,
  TimesData,
  YearData,
  browseByData,
} from '../Data/FilterData';

const Dropdown = ({ selected, setSelected, items }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  /* -------- close if user clicks outside the dropdown -------- */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="relative"
      ref={wrapperRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className="relative border border-gray-800 w-full bg-main text-white rounded-md
                  cursor-pointer py-2 above-1000:py-3 mobile:py-2 pl-6 above-1000:pl-4 mobile:pl-3 pr-10 above-1000:pr-8 mobile:pr-6 text-xs above-1000:text-[11px] mobile:text-[10px] transition
                  hover:text-customPurple flex items-center justify-between"
      >
        <span className="block truncate">{selected.title}</span>
        <FaAngleDown className="h-4 w-4 above-1000:h-3 above-1000:w-3 mobile:h-3 mobile:w-3 flex-shrink-0" />
      </button>

      {/* Options */}
      {open && (
        <ul
          className="absolute mt-1 z-50 w-full max-h-60 overflow-y-auto scrollbar-thin
                    bg-dry border border-gray-800 text-white rounded-md shadow-lg
                    text-sm above-1000:text-xs mobile:text-xs select-none"
        >
          {items.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                setSelected(item);
                setOpen(false);
              }}
              className={`py-2 above-1000:py-1.5 mobile:py-1.5 pl-10 above-1000:pl-8 mobile:pl-6 pr-4 above-1000:pr-3 mobile:pr-2 cursor-pointer relative
                          ${item.title === selected.title
                            ? 'font-semibold bg-customPurple'
                            : 'font-normal hover:bg-main/70'} transition`}
            >
              {item.title}
              {item.title === selected.title && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 above-1000:pl-2 mobile:pl-2">
                  <FaCheck className="h-3 w-3 above-1000:h-2 above-1000:w-2 mobile:h-2 mobile:w-2" aria-hidden="true" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function Filters(props) {
  const {
    categories,
    category,
    setCategory,
    language,
    setLanguage,
    year,
    setYear,
    times,
    setTimes,
    rates,
    setRates,
    browseBy,
    setBrowseBy,
  } = props?.data;

  /* What each dropdown controls */
  const Filter = [
    {
      value: browseBy,
      setter: setBrowseBy,
      items: browseByData,
    },
    {
      value: category,
      setter: setCategory,
      items:
        categories?.length > 0
          ? [{ title: 'All Categories' }, ...categories]
          : [{ title: 'No category found' }],
    },
    {
      value: language,
      setter: setLanguage,
      items: LanguageData,
    },
    {
      value: year,
      setter: setYear,
      items: YearData,
    },
    {
      value: times,
      setter: setTimes,
      items: TimesData,
    },
    {
      value: rates,
      setter: setRates,
      items: RatesData,
    },
  ];

  return (
    <div className="my-4 mb-6 mobile:mx-0 bg-dry border text-dryGray border-gray-800
                    grid md:grid-cols-6 grid-cols-2 mobile:grid-cols-2 lg:gap-12 above-1000:gap-6 mobile:gap-2 rounded-lg mobile:rounded-none p-6 above-1000:p-4 mobile:p-3">
      {Filter.map((drop, idx) => (
        <Dropdown
          key={idx}
          selected={drop.value}
          setSelected={drop.setter}
          items={drop.items}
        />
      ))}
    </div>
  );
}

export default Filters;
