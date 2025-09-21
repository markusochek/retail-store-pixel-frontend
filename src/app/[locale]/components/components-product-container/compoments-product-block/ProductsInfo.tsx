import React from 'react';

const ProductInfo = ({
  name,
  salePrice,
  quantity,
  id,
}: {
  name: string;
  salePrice: number;
  quantity: number;
  id: number;
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
        {name}
      </span>

      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">{salePrice}₽</span>
        {quantity > 0 ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {quantity} шт
          </span>
        ) : (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            Нет в наличии
          </span>
        )}
      </div>

      <span className="text-xs text-gray-500">Код: {id.toString()}</span>
    </div>
  );
};

export default ProductInfo;
