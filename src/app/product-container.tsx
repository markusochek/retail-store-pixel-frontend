import React from 'react';
import ProductBlock from "@/app/product-block";

import {getImagePath} from "@/app/lib/helpers/images";
import {diContainer} from "@/app/lib/di/di-container";
import {ProductEntity} from "@/app/entities/product.entity";

const ProductContainer = async () => {
    const products = await getProducts();

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: '2%',
        }}>
            {products.map((product: ProductEntity) => (
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
    );
};

async function getProducts() {
    const productService = await diContainer.getProductService();
    const products: ProductEntity[] = await productService.findAll();
    products.sort((a, b) => a.idFromAnotherDb - b.idFromAnotherDb);

    return products;
}

export default ProductContainer;
