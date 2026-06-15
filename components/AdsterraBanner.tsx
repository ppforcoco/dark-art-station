// components/AdsterraBanner.tsx
"use client";

interface AdsterraBannerProps {
  /** The Adsterra "key" for this ad zone (from your Adsterra dashboard) */
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders an Adsterra "Banner" ad unit (the `atOptions` + invoke.js snippets
 * from highperformanceformat.com).
 *
 * Adsterra's banner script relies on a single global `atOptions` variable
 * read at script-execution time. If multiple banner units were placed
 * directly on the page, each one would overwrite `atOptions` for the others.
 * To avoid that, each unit is rendered inside its own isolated iframe (via
 * `srcDoc`) with its own `atOptions` + invoke.js pair — this is Adsterra's
 * recommended approach for SPA / component-based sites.
 */
export default function AdsterraBanner({ adKey, width, height, className = "" }: AdsterraBannerProps) {
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
  </body>
</html>`;

  return (
    <iframe
      title="Advertisement"
      srcDoc={srcDoc}
      width={width}
      height={height}
      scrolling="no"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{
        border: "none",
        overflow: "hidden",
        display: "block",
        maxWidth: "100%",
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={className}
    />
  );
}