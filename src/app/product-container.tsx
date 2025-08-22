import React from 'react';
import ProductBlock from "@/app/product-block";

import {getImagePath} from "@/app/lib/helpers/images";
import {prisma} from "@/app/lib/db/prisma";

const ProductContainer = async () => {
    const products = await prisma.products.findMany();
    products.sort((a, b) => Number(a.id_from_another_db - b.id_from_another_db));

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: '2%',
        }}>
            {products.map((product) => (
                <ProductBlock
                    key={product.id}
                    id={product.id}
                    idFromAnotherDb={product.id_from_another_db}
                    name={product.name}
                    salePrice={product.sale_price.toNumber()}
                    pathToImage={getImagePath(product.path_to_image)}
                />
            ))}
        </div>
    );
};

export default ProductContainer;
