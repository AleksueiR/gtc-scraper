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
    return new Promise((resolve, reject) => {
        imageMagick(fileUrl)
            .crop(417, 600, 192, 0)
            .write(fileUrl, function(err: any) {
                if (err) {
                    console.log('Cannot crop image :/', err);
                    reject();
                } else {
                    console.log('Success:');
                    resolve();
                }
            });
    });
}
