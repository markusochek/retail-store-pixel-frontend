export const getImagePath = (imageName: string) => {
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasExtension = extensions.some(ext => imageName.endsWith(ext));
    return `/images/${hasExtension ? imageName : `${imageName}.jpg`}`;
};