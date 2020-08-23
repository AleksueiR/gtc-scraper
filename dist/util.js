"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sanitize_filename_1 = tslib_1.__importDefault(require("sanitize-filename"));
const download_1 = tslib_1.__importDefault(require("download"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const gm_1 = tslib_1.__importDefault(require("gm"));
const imageMagick = gm_1.default.subClass({ imageMagick: true });
function sanitize(string) {
    const char = '-';
    return sanitize_filename_1.default(string)
        .replace(/ +/g, ' ')
        .replace(/\u2013|\u2014/g, char)
        .trim();
}
exports.sanitize = sanitize;
async function downloadFile(target, destination) {
    const data = await download_1.default(target);
    fs_extra_1.default.writeFileSync(destination, data);
}
exports.downloadFile = downloadFile;
function cropPoster(fileUrl) {
    const sizeMap = {
        451: [314, 451, 243, 0],
        600: [417, 600, 192, 0]
    };
    return new Promise((resolve, reject) => {
        imageMagick(fileUrl).size((err, size) => {
            imageMagick(fileUrl)
                .crop(...sizeMap[size.height])
                .write(fileUrl, function (err) {
                if (err) {
                    console.log('Cannot crop image :/', err);
                    reject();
                }
                else {
                    console.log('Success:');
                    resolve();
                }
            });
        });
    });
}
exports.cropPoster = cropPoster;
//# sourceMappingURL=util.js.map