import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

const ProductImageSliderDots = ({
  images,
}: {
  images: { id: bigint; path_to_image: string; product_id: bigint }[];
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
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

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Нет изображения</span>
      </div>
    );
  }

  return (
    <div className="relative w-full group pb-6 ">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg">
                <Image
                  src={'/uploads/images/' + image.path_to_image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`relative transition-all duration-300 w-2`}
            >
              <div
                className={`h-2 rounded-full transition-colors ${
                  index === selectedIndex ? 'bg-blue-400 ' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSliderDots;
