// Frontend/src/Components/Ads/EffectiveGateNativeBanner.js
import React, { useEffect, useMemo, useState } from 'react';

const DEFAULT_SCRIPT_SRC =
  'https://pl27041508.effectivegatecpm.com/019a973cec8ffe0b4ea36cff849dc6cf/invoke.js';

const DEFAULT_CONTAINER_ID = 'container-019a973cec8ffe0b4ea36cff849dc6cf';

/**
 * EffectiveGate / ProfitablerateCPM iframe wrapper (SPA safe)
 * - Runs ad script inside isolated iframe srcDoc (prevents SPA "stuck" ads)
 * - Supports minWidthPx / maxWidthPx so we can target desktop vs mobile
 * - Supports aspectRatio so we can do 4:1 (desktop) and 1:1 (mobile)
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

    setMatches(mql.matches);

    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [query]);

  return matches;
};

const buildSrcDoc = ({ containerId, scriptSrc }) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
      }
      #${containerId} {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="${containerId}"></div>
    <script async data-cfasync="false" src="${scriptSrc}"></script>
  </body>
</html>`;

const buildMediaQuery = ({ minWidthPx, maxWidthPx }) => {
  const parts = [];

  const min = Number(minWidthPx);
  const max = Number(maxWidthPx);

  if (Number.isFinite(min) && min >= 0) parts.push(`(min-width: ${min}px)`);
  if (Number.isFinite(max) && max >= 0) parts.push(`(max-width: ${max}px)`);

  return parts.length ? parts.join(' and ') : '(min-width: 0px)';
};

function EffectiveGateIframeAd({
  scriptSrc = DEFAULT_SCRIPT_SRC,
  containerId = DEFAULT_CONTAINER_ID,

  // responsive gating
  minWidthPx,
  maxWidthPx,

  // layout
  aspectRatio = '4 / 1',
  minHeight = 90,

  // UI
  className = '',
  label = 'Advertisement',

  // forces iframe reload when changed
  refreshKey = '',

  // optional aria/title
  iframeTitle,
}) {
  const query = useMemo(
    () => buildMediaQuery({ minWidthPx, maxWidthPx }),
    [minWidthPx, maxWidthPx]
  );

  const matches = useMediaQuery(query);

  const srcDoc = useMemo(() => {
    return buildSrcDoc({ containerId, scriptSrc });
  }, [containerId, scriptSrc]);

  const iframeKey = useMemo(() => {
    // include everything that should trigger a hard iframe refresh
    return `${containerId}:${String(refreshKey)}:${scriptSrc}:${query}:${aspectRatio}`;
  }, [containerId, refreshKey, scriptSrc, query, aspectRatio]);

  if (!matches) return null;

  const title = iframeTitle || `effectivegate-ad-${String(refreshKey || 'default')}`;

  return (
    <section className={`w-full my-8 ${className}`} aria-label={label || 'Advertisement'}>
      <div className="border border-border bg-dry rounded-lg p-3 sm:p-4">
        {label ? (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dryGray">{label}</span>
          </div>
        ) : null}

        <div
          className="w-full overflow-hidden rounded-md bg-main"
          style={{
            aspectRatio,
            minHeight,
          }}
        >
          <iframe
            key={iframeKey}
            title={title}
            srcDoc={srcDoc}
            className="w-full h-full"
            style={{ border: 0, display: 'block' }}
            scrolling="no"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * ✅ Desktop default (4:1)
 * - Only shows on screens >= 640px
 */
export default function EffectiveGateNativeBanner({
  minWidthPx = 640,
  aspectRatio = '4 / 1',
  minHeight = 90,
  ...props
}) {
  return (
    <EffectiveGateIframeAd
      {...props}
      minWidthPx={minWidthPx}
      aspectRatio={aspectRatio}
      minHeight={minHeight}
    />
  );
}

/**
 * ✅ Mobile default (1:1)
 * - Only shows on screens <= 639px
 * NOTE: For a "true" square ad, your ad network may require a separate zone/script.
 */
export function EffectiveGateSquareAd({
  maxWidthPx = 639,
  aspectRatio = '1 / 1',
  minHeight = 260,
  ...props
}) {
  return (
    <EffectiveGateIframeAd
      {...props}
      maxWidthPx={maxWidthPx}
      aspectRatio={aspectRatio}
      minHeight={minHeight}
    />
  );
}
