"use client";

export default function ProtectedImg({
  src,
  alt,
  className,
  style,
  loading,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}