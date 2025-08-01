CREATE TABLE public.products (
                                 sale_price numeric(19, 2) NOT NULL,
                                 path_to_image varchar NULL,
                                 "name" varchar(255) NOT NULL,
                                 id bigserial NOT NULL,
                                 id_from_another_db int8 NOT NULL,
                                 CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id),
                                 CONSTRAINT products_unique_id_from_another_db UNIQUE (id_from_another_db)
);