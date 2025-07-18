import React from "react";
import { BiHomeAlt } from "react-icons/bi";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex-colo gap-8 w-full min-h-screen text-white bg-main mt-0 lg:py-20 py-5 px-6">
      <img
        className="w-2/5 h-2/4 object-contain"
        src="/images/404.png"
        alt="notfound"
      />
      <h1 className="lg:text-4xl font-bold">Page Not Found</h1>
      <p className="font-medium text-border italic leading-6">
        The page you are looking for does not exist. You may have mistyped the URL.
      </p>
      <Link
        to="/"
        className="bg-customPurple transition text-white flex-rows gap-4 font-medium py-3 px-6 hover:text-sky-300 rounded-md"
      >
        <BiHomeAlt /> Back Home
      </Link>
    </div>
  );
}

export default NotFound;
