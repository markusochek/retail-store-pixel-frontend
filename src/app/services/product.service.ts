
import {DataSource, Repository, UpdateResult} from 'typeorm';
import {ProductEntity} from '../entities/product.entity';

export class ProductService {
    private productRepository: Repository<ProductEntity>;

    constructor(connection: DataSource) {
        this.productRepository = connection.getRepository(ProductEntity);
    }

    async findAll(): Promise<ProductEntity[]> {
        return this.productRepository.find();
    }

    async create(productData: ProductEntity) {
        const isCreated = await this.productRepository.existsBy({ idFromAnotherDb: productData.idFromAnotherDb });
        if (!isCreated) {
            const product = this.productRepository.create(productData);
            return this.productRepository.save(product);
        }
        return new ProductEntity();
    }

    updatePathToImage(productIdFromAnotherDb: number, fileName: string): Promise<UpdateResult> {
        return this.productRepository.update(productIdFromAnotherDb, {pathToImage: fileName});
    }
}