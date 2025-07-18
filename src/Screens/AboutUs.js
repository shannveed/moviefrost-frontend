import React from 'react';

import Head from '../Components/Head';
import Layout from '../Layout/Layout';

function AboutUs() {
  return (
    <Layout>
      <div className="min-height-screen container mx-auto px-2 my-6">
        <Head title="About Us" />
        <div className="xl:py-20 py-10 px-4">
          <div className="grid grid-flow-row xl:grid-cols-2 gap-4 xl:gap-16 items-center">
            {/* Left Column: Text Content */}
            <div>
              <h3 className="text-xl lg:text-3xl mb-4 font-semibold">
                Welcome to MoviSphere!
              </h3>
              
              <div className="mt-3 text-sm leading-8 text-text">
                <p>
                  Step into a realm where every film tells a story, where the
                  magic of cinema unfolds at your fingertips. Since the dawn of
                  the printing press, words have shaped our world, but it's the
                  artistry of film that breathes life into tales both old and
                  new. From timeless classics to cutting-edge blockbusters, our
                  journey has been one of evolution and inspiration. As we
                  embrace the digital age, MoviSphere stands as a beacon for
                  enthusiasts everywhere, blending the rich history of
                  storytelling with the limitless possibilities of modern
                  technology. Here, the past and future of cinema converge,
                  inviting you to experience the unparalleled joy of movies
                  like never before.
                </p>
              </div>

              {/* Stat Boxes */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="p-8 bg-dry rounded-lg">
                  <span className="text-3xl block font-extrabold">5K</span>
                  <h4 className="text-lg font-semibold my-2">Listed Movies</h4>
                  <p className="mb-0 text-text leading-7 text-sm">
                    Discover our extensive collection of 5K listed movies.
                  </p>
                </div>

                <div className="p-8 bg-dry rounded-lg">
                  <span className="text-3xl block font-extrabold">8K</span>
                  <h4 className="text-lg font-semibold my-2">Lovely Users</h4>
                  <p className="mb-0 text-text leading-7 text-sm">
                    Completely Free, Without Registration.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="mt-10 lg:mt-0">
              <img
                src="/images/movies/about2.jpg"
                alt="aboutus"
                className="w-full h-full xl:h-auto rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AboutUs;
