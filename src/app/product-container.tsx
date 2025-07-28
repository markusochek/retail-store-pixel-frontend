import React from 'react';
import ProductBlock from "@/app/product-block";

import {getImagePath} from "@/app/lib/helpers/images";
import {diContainer} from "@/app/lib/di/di-container";

const ProductContainer = async () => {
    const productService = await diContainer.getProductService();
    const products:any[] = await productService.findAll();

    return (
        <>
            <div>
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
                            pathToImage={getImagePath(product.pathToImage)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ProductContainer;
