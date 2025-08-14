import thereIsNoPicture from "@/../public/icons/there-is-no-picture.png"

export const getImagePath = (imageName: string | null) => {
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (imageName !== null) {
        const hasExtension = extensions.some(ext => imageName.endsWith(ext));
        return `/uploads/images/${hasExtension ? imageName : `${imageName}.jpg`}`;
    }
    return thereIsNoPicture;
};