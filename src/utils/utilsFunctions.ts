export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function isImage(url: string): Promise<boolean> {
    if (!url || url === "") return false;
    const res = await fetch(url);
    const buff = await res.blob();

    return buff.type.startsWith("image/");
}
