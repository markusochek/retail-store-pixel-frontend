import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, Unique} from "typeorm";

@Entity("products")
export class ProductEntity {
    @PrimaryColumn('int8', {
        generated: true,
        generatedIdentity: 'ALWAYS'
    })
    id?: number;

    @Column({ unique: true })
    id_from_another_db?: number;

    @Column('varchar', { length: 255 })
    name!: string;

    @Column('numeric', { name: "sale_price", precision: 19, scale: 2 })
    salePrice!: number;

    @Column('varchar', { name: "path_to_image",  nullable: true })
    pathToImage?: string | null;
}