import React from 'react';
import ProductBlock from "@/app/product-block";

const ProductContainer = () => {
    const products = [

    ]

    const id = 957
    const name = 'Truck READY GO свет+звук метал корпус арт.0302-55'
    const unitOfMeasurement = 'шт'
    const salePrice = 650.00
    const quantity = 4.000

    return (
        <>
            <div style={{display: "flex", flexDirection: "row", flexGrow: 5}}>
                <ProductBlock id={id} name={name} salePrice={salePrice}></ProductBlock>
                <ProductBlock id={id} name={name} salePrice={salePrice}></ProductBlock>
                <ProductBlock id={id} name={name} salePrice={salePrice}></ProductBlock>
                <ProductBlock id={id} name={name} salePrice={salePrice}></ProductBlock>
                <ProductBlock id={id} name={name} salePrice={salePrice}></ProductBlock>
            </div>
        </>
    );
};

export default ProductContainer;