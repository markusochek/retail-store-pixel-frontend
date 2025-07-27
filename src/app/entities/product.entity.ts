import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, Unique} from "typeorm";

@Entity("products")
export class ProductEntity {
    @PrimaryColumn('int8', {
        generated: true,
        generatedIdentity: 'ALWAYS'
    })
    id?: number;

    @Column('int8', { name: "id_from_another_db", unique: true })
    idFromAnotherDb?: number;

    @Column('varchar', { length: 255 })
    name!: string;

    @Column('numeric', { name: "sale_price", precision: 19, scale: 2 })
    salePrice!: number;

    @Column('varchar', { name: "path_to_image",  nullable: true })
    pathToImage?: string | null;
}