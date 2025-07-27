import React from 'react';

const ProductBlock = ({ id, idFromAnotherDb, name, salePrice, path_to_image }: {id: number, idFromAnotherDb: number, name: string, salePrice: number, path_to_image: string}) => {
    return (
        <>
            <div style={{display: "flex", flexDirection: "column", whiteSpace: "pre-line", width: "18%"}}>
                <img src={path_to_image} alt="error loaded"/>
                <span>Код: {idFromAnotherDb}</span>
                <span style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px',}}>{name}</span>
                <span>Розничная цена</span>
                <span>{salePrice}₽</span>
            </div>
        </>
    );
};

export default ProductBlock;