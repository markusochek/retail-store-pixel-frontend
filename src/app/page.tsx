import ProductContainer from "@/app/product-container";
import fs from "node:fs";
import Header from "@/app/Header";
import {prisma} from "@/app/lib/db/prisma";
import {parseProductsFile} from "@/app/lib/helpers/parse-products-files";

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
