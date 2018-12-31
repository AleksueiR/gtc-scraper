"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const walkdir = tslib_1.__importStar(require("walkdir"));
const promise_1 = tslib_1.__importDefault(require("promise"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const ledger_1 = require("./../model/ledger");
const util_1 = require("./../util");
const readJson = promise_1.default.denodeify(fs_extra_1.default.readJson);
async function examine(baseDir) {
    const ledger = new ledger_1.Ledger(await readJson(`${baseDir}${path_1.default.sep}ledger.json`));
    const dirs = walkdir.sync(baseDir, {
        no_recurse: true
    });
    dirs.forEach(dir => processFolder(ledger, baseDir, dir));
}
exports.default = examine;
async function processFolder(ledger, baseDir, dir) {
    if (!(await fs_extra_1.default.lstat(dir)).isDirectory()) {
        console.log(`Skipping file '${dir}'`);
        return;
    }
    const matches = dir.match(/(\d{3,4}).*/);
    if (!matches) {
        console.log(`Skipping malformed folder '${dir}'`);
        return;
    }
    const courseMeta = ledger.pages.find(p => p.id === matches[1]);
    if (!courseMeta) {
        console.log(`Cannot find '${matches[1]}' course info`);
        return;
    }
    if (fs_extra_1.default.existsSync(`${dir}${path_1.default.sep}tvshow.nfo`)) {
        console.log(`Metada exists; skipping folder '${dir}'`);
        return;
    }
    console.log(`Processing course '${courseMeta.id} - ${courseMeta.title}'`);
    const validCorseDir = `${baseDir}${path_1.default.sep}${courseMeta.id} - ${courseMeta.safeTitle}`;
    fs_extra_1.default.renameSync(`${dir}`, validCorseDir);
    const files = walkdir.sync(validCorseDir, {
        no_recurse: true
    });
    const validSeasonDir = `${validCorseDir}${path_1.default.sep}Season 01`;
    fs_extra_1.default.mkdirSync(validSeasonDir);
    files.forEach((f, index) => {
        const episodeMeta = courseMeta.lectures[index];
        const fileShortName = `${courseMeta.shortTitle} - s01e${episodeMeta.id.padStart(2, '0')} - ${episodeMeta.safeTitle}`;
        fs_extra_1.default.renameSync(f, `${validSeasonDir}${path_1.default.sep}${fileShortName}${path_1.default.extname(f)}`);
        fs_extra_1.default.outputFileSync(`${validSeasonDir}${path_1.default.sep}${fileShortName}.nfo`, episodeMeta.episodeInfo, 'utf8');
    });
    fs_extra_1.default.outputFileSync(`${validCorseDir}${path_1.default.sep}tvshow.nfo`, courseMeta.showInfo, 'utf8');
    getPosterImages(courseMeta, baseDir);
    getFanartImages(courseMeta, baseDir);
}
async function getPosterImages(courseMeta, baseDir) {
    if (!courseMeta.posterUrl) {
        return;
    }
    const imgExt = path_1.default.extname(courseMeta.posterUrl);
    const courseDir = `${baseDir}${path_1.default.sep}${courseMeta.id} - ${courseMeta.safeTitle}`;
    await util_1.downloadFile(courseMeta.posterUrl, `${courseDir}${path_1.default.sep}poster${imgExt}`);
    await util_1.cropPoster(`${courseDir}${path_1.default.sep}poster${imgExt}`);
    fs_extra_1.default.copySync(`${courseDir}${path_1.default.sep}poster${imgExt}`, `${courseDir}${path_1.default.sep}season01-poster${imgExt}`);
    fs_extra_1.default.copySync(`${courseDir}${path_1.default.sep}poster${imgExt}`, `${courseDir}${path_1.default.sep}season-all-poster${imgExt}`);
}
function getFanartImages(courseMeta, baseDir) {
    if (!courseMeta.fanartUrls) {
        return;
    }
    let courseDir = `${baseDir}${path_1.default.sep}${courseMeta.id} - ${courseMeta.safeTitle}`;
    courseMeta.fanartUrls.forEach((fu, index) => {
        const fanartFileName = `fanart${path_1.default.extname(fu)}`;
        if (index === 1) {
            courseDir += `${path_1.default.sep}extrafanart`;
            if (!fs_extra_1.default.existsSync(courseDir)) {
                fs_extra_1.default.mkdirSync(courseDir);
            }
        }
        util_1.downloadFile(fu, `${courseDir}${path_1.default.sep}${index === 0 ? fanartFileName : path_1.default.basename(fu)}`);
    });
}
function getActorImages(courseMeta, baseDir) {
    if (courseMeta.professor.length === 0) {
        return;
    }
    let actorsDir = `${baseDir}${path_1.default.sep}${courseMeta.id} - ${courseMeta.safeTitle}${path_1.default.sep}.actors`;
    if (!fs_extra_1.default.existsSync(actorsDir)) {
        fs_extra_1.default.mkdirSync(actorsDir);
    }
    courseMeta.professor.forEach(pr => {
        util_1.downloadFile(pr.image, `${actorsDir}${path_1.default.sep}${pr.name.replace(/ /g, '_')}.jpg`);
    });
}
//# sourceMappingURL=walker.js.map