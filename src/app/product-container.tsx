import React from 'react';
import ProductBlock from "@/app/product-block";
import { ProductService } from './services/product.service';

import * as fs from "node:fs";
import {getImagePath} from "@/app/lib/helpers/images";
import {diContainer} from "@/app/lib/di/di-container";

const ProductContainer = async () => {
    const productService = await diContainer.getProductService();

    const productsFromFile = parseProductsFile('products');
    for (let productFromFile of productsFromFile) {
        await productService.create(productFromFile);
    }

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
                        id_from_another_db={product.id_from_another_db}
                        name={product.name}
                        salePrice={product.salePrice}
                        path_to_image={getImagePath("37522b69_4c36_11f0_84a5_0cc47adeeeb3_2465ba59_4cce_11f0_84a5_0cc47adeeeb3.webp")}
                    />
                ))}
            </div>
        </>
    );
};

function parseProductsFile(filename: fs.PathOrFileDescriptor) {
    try {
        const content = fs.readFileSync(filename, 'utf8');

        const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');

        if (lines.length < 2) {
            throw new Error('Файл не содержит данных или заголовков');
        }

        const headers = lines[0].split(/\t|\s{2,}/).filter((part: string) => part !== '');
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(/\t|\s{2,}/).filter((part: string) => part !== '');

            if (parts.length !== headers.length) {
                console.warn(`Строка ${i} имеет неверное количество колонок:`, parts);
                continue;
            }

            try {
                products.push({
                    id_from_another_db: +parts[0],
                    name: parts[1],
                    unitOfMeasurement: parts[2],
                    salePrice: parseFloat(parts[3].replace(/\s/g, '').replace(',', '.')),
                    quantity: parseFloat(parts[4].replace(',', '.'))
                });
            } catch (e: any) {
                console.warn(`Ошибка обработки строки ${i}:`, e.message);
            }
        }

        return products;
    } catch (e: any) {
        console.error('Ошибка парсинга файла:', e.message);
        return [];
    }
}

export default ProductContainer;
