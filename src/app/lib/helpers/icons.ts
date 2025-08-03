export const getIconPath = (imageName: string) => {
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasExtension = extensions.some(ext => imageName.endsWith(ext));
    return `/icons/${hasExtension ? imageName : `${imageName}.jpg`}`;
};