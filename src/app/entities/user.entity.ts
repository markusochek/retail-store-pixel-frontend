import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity("users")
export class UserEntity {
    @PrimaryColumn('int8', {
        generated: true,
        generatedIdentity: 'ALWAYS'
    })
    id?: number;

    @Column('varchar', { length: 128 })
    email!: string;

    @Column('varchar', { length: 128 })
    password!: string;

    @Column('boolean', { name: "is_admin"})
    isAdmin?: boolean;
}