import React from 'react';

const ProductBlock = ({ id, name, salePrice }: {id: number, name: string, salePrice: number}) => {
    return (
        <>
            <div style={{display: "flex", flexDirection: "column", whiteSpace: "pre-line"}}>
                <img height={"100px"} width={"100px"} src="37522b69_4c36_11f0_84a5_0cc47adeeeb3_2465ba59_4cce_11f0_84a5_0cc47adeeeb3.webp" alt="error loaded"/>
                <span>Код: {id}</span>
                <span>{name}</span>
                <span>Розничная цена {salePrice}₽</span>
            </div>
        </>
    );
};

export default ProductBlock;