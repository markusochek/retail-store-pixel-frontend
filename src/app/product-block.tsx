import React from 'react';

const ProductBlock = ({ id, name, salePrice }: {id: number, name: string, salePrice: number}) => {
    return (
        <>
            <div style={{display: "flex", flexDirection: "column", whiteSpace: "pre-line", width: "18%"}}>
                <img src="37522b69_4c36_11f0_84a5_0cc47adeeeb3_2465ba59_4cce_11f0_84a5_0cc47adeeeb3.webp" alt="error loaded"/>
                <span>Код: {id}</span>
                <span style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px',}}>{name}</span>
                <span>Розничная цена</span>
                <span>{salePrice}₽</span>
            </div>
        </>
    );
};

export default ProductBlock;