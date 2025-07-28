import Filter from "@/app/filter";
import ProductContainer from "@/app/product-container";
import {diContainer} from "@/app/lib/di/di-container";
import fs from "node:fs";
import {getImagePath} from "@/app/lib/helpers/images";

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
                    idFromAnotherDb: +parts[0],
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

export default async function Home() {
    const productService = await diContainer.getProductService();

    const productsFromFile = parseProductsFile('products');
    for (let productFromFile of productsFromFile) {
        await productService.create(productFromFile);
    }

    const intervalRequestProductsFile = setInterval(async () => {
        const productService = await diContainer.getProductService();

        const productsFromFile = parseProductsFile('products');
        for (let productFromFile of productsFromFile) {
            await productService.create(productFromFile);
        }
    }, 100000);

    return (
    <>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
            <div style={{display: "flex", flexDirection: "column", marginLeft: "10%", marginRight: "10%"}}>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginRight: "5%" }}>
                        <img src={getImagePath("yumminky-pc-43-1024.webp")} alt={"пользователь"} style={{height: "50%", width: "50%"}}/>
                        <div style={{}}>ВОЙТИ</div>
                    </div>
                </div>
                <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Filter></Filter>
                    <ProductContainer></ProductContainer>
                </div>
            </div>
        </div>
    </>
    );
}
