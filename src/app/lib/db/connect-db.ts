import {ProductEntity} from "@/app/entities/product.entity";
import {DataSource} from "typeorm";

let connection: DataSource;

export async function getDatabaseConnection(): Promise<DataSource> {
    if (connection?.isInitialized) {
        return connection;
    }

    connection = new DataSource({
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [ProductEntity],
        synchronize: false,
        logging: false,
    });

    try {
        await connection.initialize();
        console.log("Database connection established");
        return connection;
    } catch (error) {
        console.error("Database connection failed", error);
        throw error;
    }
}