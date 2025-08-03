import {ProductService} from "@/app/services/product.service";
import {getDatabaseConnection} from "@/app/lib/db/connect-db";
import {UserService} from "@/app/services/user.service";

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

    async getUserService(): Promise<UserService> {
        if (!this.services.has("userService")) {
            const connection = await getDatabaseConnection();
            const service = new UserService(connection);
            this.services.set("userService", service);
        }
        return this.services.get("userService");
    }
}

export const diContainer = DIContainer.getInstance();