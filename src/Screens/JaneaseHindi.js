// src/Screens/JaneaseHindi.js
import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../Layout/Layout';
import Movie from '../Components/movie';
import Loader from '../Components/Loader';
import { Empty } from '../Components/Notifications/Empty';
import { getAllMoviesService } from '../Redux/APIs/MoviesServices';
import MetaTags from '../Components/SEO/MetaTags';

const BROWSE_VALUES = [
  'Japanese Web Series (Hindi)',
];

function JaneaseHindi() {
  const [items, setItems] = useState([]);
  const [pageMap, setPageMap] = useState(() =>
    Object.fromEntries(BROWSE_VALUES.map((v) => [v, 1]))
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const totalLoaded = useMemo(() => items.length, [items]);

  const fetchPages = async (pagesByBrowse) => {
    const results = await Promise.all(
      BROWSE_VALUES.map((b) =>
        getAllMoviesService('', '', '', '', '', b, '', pagesByBrowse[b] || 1)
      )
    );
    const map = new Map(items.map((m) => [m._id, m]));
    results.forEach((res) => res.movies.forEach((m) => map.set(m._id, m)));
    return Array.from(map.values());
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const merged = await fetchPages(pageMap);
        if (!cancelled) setItems(merged);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load Janease Hindi titles');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const newPages = Object.fromEntries(
        BROWSE_VALUES.map((b) => [b, (pageMap[b] || 1) + 1])
      );
      const merged = await fetchPages(newPages);
      setItems(merged);
      setPageMap(newPages);
    } catch (e) {
      setError(e?.message || 'Failed to load more titles');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Layout>
      <MetaTags
        title="Japanease Hindi | MovieFrost"
        description="Watch Japanese Web Series (Hindi) online for free in HD."
        keywords="Japanese Web Series Hindi, Japanease Hindi, free HD streaming"
        url="https://www.moviefrost.com/Janease-Hindi"
      />
      <div className="container mx-auto px-8 mobile:px-4 my-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Japanease Hindi</h1>
          <span className="text-sm text-border">Showing {totalLoaded} items</span>
        </div>

        {loading ? (
          <div className="w-full gap-6 flex-colo min-h-[50vh]">
            <Loader />
          </div>
        ) : error ? (
          <div className="w-full gap-6 flex-colo min-h-[50vh]">
            <Empty message={error} />
          </div>
        ) : items.length === 0 ? (
          <div className="w-full gap-6 flex-colo min-h-[50vh]">
            <Empty message="No Japanease Hindi titles found" />
          </div>
        ) : (
          <>
            <div className="grid sm:mt-6 mt-4 xl:grid-cols-5 above-1000:grid-cols-5 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 mobile:grid-cols-2 grid-cols-1 gap-4 mobile:gap-2">
              {items.map((movie) => (
                <Movie key={movie._id} movie={movie} />
              ))}
            </div>

            <div className="w-full flex items-center justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-customPurple text-white px-6 py-3 rounded hover:bg-opacity-80 transitions"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default JaneaseHindi;
