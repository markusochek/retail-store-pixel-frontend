import React from 'react';

const ProductBlock = ({ id, id_from_another_db, name, salePrice, path_to_image }: {id: number, id_from_another_db: number, name: string, salePrice: number, path_to_image: string}) => {
    return (
        <>
            <div style={{display: "flex", flexDirection: "column", whiteSpace: "pre-line", width: "18%"}}>
                <img src={path_to_image} alt="error loaded"/>
                <span>Код: {id_from_another_db}</span>
                <span style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px',}}>{name}</span>
                <span>Розничная цена</span>
                <span>{salePrice}₽</span>
            </div>
        </>
    );
};

export default ProductBlock;