'use client'

import React, {useRef, useState} from 'react';
import Image, {StaticImageData} from "next/image";
import { Decimal } from '@prisma/client/runtime/library';

const ProductBlock = ({ id, idFromAnotherDb, name, salePrice, pathToImage }: {id: bigint, idFromAnotherDb: bigint, name: string, salePrice: number, pathToImage: StaticImageData | string}) => {
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDivClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('productId', id.toString());

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки файла');
            }

            const data = await response.json();
            setUploadedImageUrl(data.url)
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить изображение');
        }
    };

    return (
        <div style={{display: "flex", flexDirection: "column", whiteSpace: "pre-line", width: "18%" }}>
            <div onClick={handleDivClick} style={{display: "flex", justifyContent: "center", alignItems: "center", border: "2px dashed #000000", cursor: "pointer"}} className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                    src={uploadedImageUrl || pathToImage}
                    alt={"error loaded"}
                    fill
                    className="object-cover"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                />
            </div>
            <span style={{}}>Код: {idFromAnotherDb}</span>
            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
            <span style={{}}>Розничная цена</span>
            <span style={{}}>{salePrice}₽</span>
        </div>
    );
};

export default ProductBlock;