import {ProductService} from "@/app/services/product.service";
import {getDatabaseConnection} from "@/app/lib/db/connect-db";

class DIContainer {
    private static instance: DIContainer;
    private services: Map<string, any> = new Map();

    private constructor() {}

    public static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    async getProductService(): Promise<ProductService> {
        if (!this.services.has("productService")) {
            const connection = await getDatabaseConnection();
            const service = new ProductService(connection);
            this.services.set("productService", service);
        }
        return this.services.get("productService");
    }
}

export const diContainer = DIContainer.getInstance();