'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

const ProductImageGallery = ({ images }: { images: { path_to_image: string }[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbnailClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full flex gap-4 items-start">
      {images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onThumbnailClick(index)}
              className={`relative w-12 h-12 rounded border-2 transition-all  cursor-pointer ${
                index === selectedIndex
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={'/uploads/images/' + image.path_to_image}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="48px"
                className="object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="relative aspect-[3/4] rounded-lg flex items-center justify-center">
                <Image
                  src={'/uploads/images/' + image.path_to_image}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 500px"
                  className="object-cover rounded"
                  priority={index === 0}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
