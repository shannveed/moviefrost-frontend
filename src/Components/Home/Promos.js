import React from 'react';
import { FaUser } from 'react-icons/fa';

function Promos() {
  return (
    <div className="my-12 py-10 md:px-19.5 px-8 bg-dry">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 items-center">
        <div className="flex lg:gap-10 gap-6 flex-col">
          <h1 className="xl:text-3xl text-lg capitalize font-sans font-medium xl:leading-relaxed">
            Download Movies & Watch Offline <br /> Enjoy on Your Mobile
          </h1>
          <p className="text-text text-xs xl:text-base leading-4 xl:leading-8">
           Discover the ultimate convenience of downloading your favorite movies 
           and watching them offline. Whether you're on the go or simply want to
           save your mobile data, enjoy seamless entertainment at your fingertips.
           Watch anytime, anywhere, with uninterrupted enjoyment on your mobile device.
            </p>
            <div className="flex gap-4 md:text-lg text-xs">
              <div className="flex-colo bg-black text-customPurple px-4 py-2 rounded font-bold">
                HD 4K
              </div>
              <div className="flex-rows gap-4 bg-black text-customPurple px-4 py-2 rounded font-bold">
                <FaUser/> 2K
              </div>
            </div>
        </div>
        <div>
          <img
            src="/images/movies/mobile.png"
            alt="Mobile app"
            className="w-full object-contain max-h-96	"
          />
        </div>

      </div>
    </div>
  );
}

export default Promos;
