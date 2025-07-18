// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const Links = [
    {
      title: 'Company',
      links: [
        { name: 'Home', link: '/' },
        { name: 'About Us', link: '/about-us' },
        { name: 'Contact Us', link: '/contact-us' },
        { name: 'Movies', link: '/movies' },
      ],
    },
    {
      title: 'Top Categories',
      links: [
        { name: 'Action', link: '/#' },
        { name: 'Romantic', link: '/#' },
        { name: 'Drama', link: '/#' },
        { name: 'Historical', link: '/#' },
      ],
    },
    {
      title: 'My Account',
      links: [
        { name: 'Dashboard', link: '/dashboard' },
        { name: 'My Favorites', link: '/favorites' },
        { name: 'Profile', link: '/profile' },
        { name: 'Change Password', link: '/password' },
      ],
    },
  ];

  return (
    <div className="bg-dry py-4 mx-6 mobile:mx-0 border-t-2 border-black above-1000:ml-8">
      <div className="container mx-auto px-4 mobile:px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 py-10 mobile:py-6">
          {Links.map((linkGroup, index) => (
            <div key={index} className="col-span-1 pb-3.5 sm:pb-0">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                {linkGroup.title}
              </h3>
              <ul className="text-sm flex flex-col space-y-3">
                {linkGroup.links.map((item, idx) => (
                  <li key={idx} className="flex items-baseline">
                    <Link
                      to={item.link}
                      className="text-border inline-block w-full hover:text-customPurple"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-1 pb-3.5 sm:pb-0">
            <Link to="/">
              <img
                src="/images/MOVIEFROST.png"
                alt="logo"
                className="w-2/4 object-contain h-12"
              />
            </Link>
            <p className="leading-7 text-sm text-border mt-3">
              <span>
              Box No. 76706, Dubai <br />Dubai, UAE
              </span>
              <br />
              <span>Tell: +9714-2261242 </span>
              <br />
              <span>Email: shannaveed50@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
