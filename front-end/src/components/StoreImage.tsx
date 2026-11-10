import Image, { type ImageProps } from 'next/image';

/** Resize local/R2 artwork without allowing arbitrary external optimizer hosts. */
export default function StoreImage({ src, alt, unoptimized, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  const source = src.replace(/^https?:\/\/(?:www\.)?ecloraalgerie\.com(?=\/uploads\/)/i, '');
  if (!source) return null;
  const canOptimize = (source.startsWith('/') && !source.startsWith('//')) || source.startsWith('https://images.unsplash.com/');
  return <Image {...props} alt={alt} src={source} unoptimized={unoptimized ?? !canOptimize} />;
}
