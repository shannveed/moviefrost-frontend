// Frontend/src/Components/Ads/EffectiveGateNativeBanner.js
import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_SCRIPT_SRC =
  'https://pl27041508.effectivegatecpm.com/019a973cec8ffe0b4ea36cff849dc6cf/invoke.js';

const DEFAULT_CONTAINER_ID = 'container-019a973cec8ffe0b4ea36cff849dc6cf';

/**
 * EffectiveGate / ProfitablerateCPM "Native Banner" (4:1)
 *
 * ✅ Loads ONLY on screens >= 640px (Tailwind "sm" breakpoint by default).
 * ✅ Injects script dynamically (SPA-safe).
 * ✅ Stable 4:1 bordered slot so layout doesn't jump.
 */

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // keep correct initial
    setMatches(mql.matches);

    // Safari fallback
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [query]);

  return matches;
};

export default function EffectiveGateNativeBanner({
  scriptSrc = DEFAULT_SCRIPT_SRC,
  containerId = DEFAULT_CONTAINER_ID,
  minWidthPx = 640,
  className = '',
  label = 'Advertisement',
}) {
  const query = useMemo(() => {
    const w = Number(minWidthPx);
    const safe = Number.isFinite(w) && w > 0 ? w : 640;
    return `(min-width: ${safe}px)`;
  }, [minWidthPx]);

  const isDesktop = useMediaQuery(query);

  const mountRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (!isDesktop) return;

    const mount = mountRef.current;
    if (!mount) return;

    const container = mount.querySelector(`#${containerId}`);
    if (!container) return;

    // clear old ad content (important for SPA route/tab switches)
    container.innerHTML = '';

    // remove old script if any
    if (scriptRef.current) {
      try {
        scriptRef.current.remove();
      } catch {}
      scriptRef.current = null;
    }

    // inject script exactly like provider snippet
    const script = document.createElement('script');
    script.async = true;
    script.src = scriptSrc;
    script.setAttribute('data-cfasync', 'false');

    // Insert script right before the container div (stable)
    mount.insertBefore(script, container);
    scriptRef.current = script;

    // cleanup on unmount (route/tab change)
    return () => {
      try {
        container.innerHTML = '';
      } catch {}
      try {
        scriptRef.current?.remove();
      } catch {}
      scriptRef.current = null;
    };
  }, [isDesktop, scriptSrc, containerId]);

  // ✅ nothing on mobile → no network request, no script load
  if (!isDesktop) return null;

  return (
    <section className={`w-full my-8 ${className}`} aria-label="Advertisement">
      <div className="border border-border bg-dry rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-dryGray">{label}</span>
        </div>

        {/* Stable 4:1 slot (prevents ugly jumps) */}
        <div
          ref={mountRef}
          className="w-full overflow-hidden rounded-md bg-main"
          style={{
            aspectRatio: '4 / 1',
            minHeight: 90,
          }}
        >
          <div id={containerId} className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}
