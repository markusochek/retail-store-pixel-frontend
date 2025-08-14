import Filter from "@/app/filter";
import ProductContainer from "@/app/product-container";
import fs from "node:fs";
import Header from "@/app/Header";
import {prisma} from "@/app/lib/db/connect-db";

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
                    unit_of_measurement: parts[2],
                    sale_price: parseFloat(parts[3].replace(/\s/g, '').replace(',', '.')),
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
    const intervalRequestProductsFile = setInterval(async () => {
        const productsFromFile = parseProductsFile('products');
        for (const productFromFile of productsFromFile) {
            const existingProduct = await prisma.products.findUnique({
                where: { id_from_another_db: productFromFile.id_from_another_db }
            });

            if (!existingProduct) {
                await prisma.products.create({ data: productFromFile });
            }
        }
    }, 100000);

    return (
    <>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
            <div style={{display: "flex", flexDirection: "column", marginLeft: "10%", marginRight: "10%"}}>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                    <Header/>
                </div>
                <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    {/*<Filter></Filter>*/}
                    <ProductContainer></ProductContainer>
                </div>
            </div>
        </div>
    </>
    );
}
