
import {DataSource, Repository} from 'typeorm';
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
        const isCreated = await this.productRepository.existsBy({ id_from_another_db: productData.id_from_another_db });
        if (!isCreated) {
            const product = this.productRepository.create(productData);
            return this.productRepository.save(product);
        }
        return new ProductEntity();
    }
}