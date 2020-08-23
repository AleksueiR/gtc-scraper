import sanitizeFilename from 'sanitize-filename';
import download from 'download';
import fsExtra from 'fs-extra';
import gm from 'gm';

const imageMagick = gm.subClass({ imageMagick: true });

export function sanitize(string: string) {
    const char = '-';

    return sanitizeFilename(string)
        .replace(/ +/g, ' ')
        .replace(/\u2013|\u2014/g, char)
        .trim();
}

export async function downloadFile(target: string, destination: string) {
    const data = await download(target);
    fsExtra.writeFileSync(destination, data);
}

export function cropPoster(fileUrl: string): Promise<void> {
    const sizeMap: Record<number, [number, number, number, number]> = {
        451: [314, 451, 243, 0],
        600: [417, 600, 192, 0]
    };

    return new Promise((resolve, reject) => {
        imageMagick(fileUrl).size((err, size) => {
            imageMagick(fileUrl)
                .crop(...sizeMap[size.height])
                .write(fileUrl, function (err: any) {
                    if (err) {
                        console.log('Cannot crop image :/', err);
                        reject();
                    } else {
                        console.log('Success:');
                        resolve();
                    }
                });
        });
    });
}
