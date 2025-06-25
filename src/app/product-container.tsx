import React from 'react';
import ProductBlock from "@/app/product-block";

const ProductContainer = () => {
    return (
        <>
            <div style={{display: "flex", flexDirection: "row", flexGrow: 5}}>
                <ProductBlock></ProductBlock>
                <ProductBlock></ProductBlock>
                <ProductBlock></ProductBlock>
                <ProductBlock></ProductBlock>
                <ProductBlock></ProductBlock>
            </div>
        </>
    );
};

export default ProductContainer;