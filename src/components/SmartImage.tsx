import Image from 'next/image';

type SmartImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function canOptimize(src: string) {
  if (!src || src.startsWith('data:')) return false;
  if (src.startsWith('/')) return true;
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    return (
      hostname === 'media.malakinfo.com' ||
      hostname === 'images.unsplash.com' ||
      hostname === 'localhost' ||
      hostname.endsWith('.r2.cloudflarestorage.com') ||
      hostname.endsWith('.malakinfo.com')
    );
  } catch {
    return false;
  }
}

/** Prefer next/image when the host is allowlisted; otherwise fall back to native img. */
export default function SmartImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority = false,
}: SmartImageProps) {
  if (!canOptimize(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        {...(fill ? {} : { width, height })}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '100vw'}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 450}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
