import React from 'react';
import ProductBlock from "@/app/product-block";

import {getImagePath} from "@/app/lib/helpers/images";
import {diContainer} from "@/app/lib/di/di-container";

const ProductContainer = async () => {
    const productService = await diContainer.getProductService();
    const products:any[] = await productService.findAll();

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "row",
                flexGrow: 5,
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                gap: '2%',
            }}>
                {products.map((product) => (
                    <ProductBlock
                        key={product.id}
                        id={product.id}
                        idFromAnotherDb={product.idFromAnotherDb}
                        name={product.name}
                        salePrice={product.salePrice}
                        path_to_image={getImagePath("37522b69_4c36_11f0_84a5_0cc47adeeeb3_2465ba59_4cce_11f0_84a5_0cc47adeeeb3.webp")}
                    />
                ))}
            </div>
        </>
    );
};

export default ProductContainer;
