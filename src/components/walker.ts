import * as walkdir from 'walkdir';
import promise from 'promise';
import fsExtra from 'fs-extra';
import p from 'path';

import { Ledger, Page } from './../model/ledger';
import { downloadFile, cropPoster } from './../util';

const readJson = promise.denodeify(fsExtra.readJson);
// const outputJson = promise.denodeify(fsExtra.outputJson);

export default async function examine(baseDir: string) {
    const ledger: Ledger = new Ledger(await readJson(`${baseDir}${p.sep}ledger.json`));

    const dirs: string[] = walkdir.sync(baseDir, {
        no_recurse: true
    });

    dirs.forEach((dir) => processFolder(ledger, baseDir, dir));
}

async function processFolder(ledger: Ledger, baseDir: string, dir: string): Promise<void> {
    if (!(await fsExtra.lstat(dir)).isDirectory()) {
        console.log(`Skipping file '${dir}'`);

        return;
    }

    const matches = dir.match(/(\d{3,4}).*/);
    if (!matches) {
        console.log(`Skipping malformed folder '${dir}'`);
        return;
    }

    const courseMeta = ledger.pages.find((p) => p.id === matches[1]);
    if (!courseMeta) {
        console.log(`Cannot find '${matches[1]}' course info`);
        return;
    }

    if (fsExtra.existsSync(`${dir}${p.sep}tvshow.nfo`)) {
        console.log(`Metada exists; skipping folder '${dir}'`);
        return;
    }

    console.log(`Processing course '${courseMeta.id} - ${courseMeta.title}'`);

    const validCorseDir = `${baseDir}${p.sep}${courseMeta.id} - ${courseMeta.safeTitle}`;

    // rename folder to use the proper course titile
    fsExtra.renameSync(`${dir}`, validCorseDir);

    const files: string[] = walkdir.sync(validCorseDir, {
        no_recurse: true
    });

    // move espisoder into a season folder
    const validSeasonDir = `${validCorseDir}${p.sep}Season 01`;
    fsExtra.mkdirSync(validSeasonDir);
    files.forEach((f, index) => {
        const episodeMeta = courseMeta.lectures[index];
        const fileShortName = `${courseMeta.shortTitle} - s01e${episodeMeta.id.padStart(2, '0')} - ${
            episodeMeta.safeTitle
        }`;

        fsExtra.renameSync(f, `${validSeasonDir}${p.sep}${fileShortName}${p.extname(f)}`);

        // write expisode nfo files
        fsExtra.outputFileSync(`${validSeasonDir}${p.sep}${fileShortName}.nfo`, episodeMeta.episodeInfo, 'utf8');
    });

    // write show nfo file
    fsExtra.outputFileSync(`${validCorseDir}${p.sep}tvshow.nfo`, courseMeta.showInfo, 'utf8');

    getPosterImages(courseMeta, baseDir);
    getFanartImages(courseMeta, baseDir);
    // getActorImages(courseMeta, baseDir);
}

async function getPosterImages(courseMeta: Page, baseDir: string): Promise<void> {
    if (!courseMeta.posterUrl) {
        return;
    }

    const imgExt = p.extname(courseMeta.posterUrl);
    const courseDir = `${baseDir}${p.sep}${courseMeta.id} - ${courseMeta.safeTitle}`;

    // download poster and make two more copies of it
    // for some reason, the new url point to the smaller image; try to get the bigger one first
    await downloadFile(
        courseMeta.posterUrl.replace('plus_image/800x451', 'image/800x600'),
        `${courseDir}${p.sep}poster${imgExt}`
    ).catch(() => downloadFile(courseMeta.posterUrl!, `${courseDir}${p.sep}poster${imgExt}`));

    await cropPoster(`${courseDir}${p.sep}poster${imgExt}`);
    fsExtra.copySync(`${courseDir}${p.sep}poster${imgExt}`, `${courseDir}${p.sep}season01-poster${imgExt}`);
    fsExtra.copySync(`${courseDir}${p.sep}poster${imgExt}`, `${courseDir}${p.sep}season-all-poster${imgExt}`);
}

function getFanartImages(courseMeta: Page, baseDir: string): void {
    if (!courseMeta.fanartUrls) {
        return;
    }

    let courseDir = `${baseDir}${p.sep}${courseMeta.id} - ${courseMeta.safeTitle}`;

    courseMeta.fanartUrls.forEach((fu, index) => {
        const fanartFileName = `fanart${p.extname(fu)}`;
        if (index === 1) {
            courseDir += `${p.sep}extrafanart`;
            if (!fsExtra.existsSync(courseDir)) {
                fsExtra.mkdirSync(courseDir);
            }
        }

        // download fanart and make two more copies of it
        downloadFile(fu, `${courseDir}${p.sep}${index === 0 ? fanartFileName : p.basename(fu)}`);
    });
}

function getActorImages(courseMeta: Page, baseDir: string): void {
    if (courseMeta.professor.length === 0) {
        return;
    }

    let actorsDir = `${baseDir}${p.sep}${courseMeta.id} - ${courseMeta.safeTitle}${p.sep}.actors`;

    if (!fsExtra.existsSync(actorsDir)) {
        fsExtra.mkdirSync(actorsDir);
    }

    courseMeta.professor.forEach((pr) => {
        downloadFile(pr.image, `${actorsDir}${p.sep}${pr.name.replace(/ /g, '_')}.jpg`);
    });
}
