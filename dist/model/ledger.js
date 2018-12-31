"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const moment_1 = tslib_1.__importDefault(require("moment"));
const jstoxml_1 = tslib_1.__importDefault(require("jstoxml"));
const util_1 = require("./../util");
class Ledger {
    constructor(value) {
        this.pages = value.pages.map(p => new Page(p));
    }
}
exports.Ledger = Ledger;
class Page {
    constructor(value) {
        ({ title: this.title, description: this.description, rating: this.rating, id: this.id } = value);
        this.lectures = value.lectures.map(l => new Lecture(l, this));
        this.images = value.images.map(i => new Image(i));
        this.professor = value.professor.map(p => new Professor(p));
    }
    get safeTitle() {
        return util_1.sanitize(this.title.replace(':', ` - `));
    }
    get shortTitle() {
        let result = '';
        let num = 6;
        util_1.sanitize(this.title)
            .split(' ')
            .forEach(elm => {
            result += (num > 0 && elm[0]) || '';
            num--;
        });
        return result;
    }
    get showInfo() {
        const jsonObject = {
            tvshow: {
                title: this.title,
                showtitle: this.title,
                rating: parseInt(this.rating),
                votes: '100',
                year: '0',
                season: '1',
                episode: this.lectures.length,
                displayseason: '-1',
                displayepisode: '-1',
                plot: this.description,
                runtime: 31,
                mpaa: 'TV-14',
                playcount: '0',
                status: 'Ended',
                genre: 'Education',
                premiered: moment_1.default().format('YYYY-MM-DD'),
                aired: moment_1.default().format('YYYY-MM-DD'),
                studio: 'TGC',
                actor: this.professor.map(p => p.actorInfo),
                resume: {
                    position: '0.000000',
                    total: '0.000000'
                }
            }
        };
        return jstoxml_1.default.toXML(jsonObject, {
            header: true,
            indent: '    '
        });
    }
    get posterUrl() {
        const image = this.images.length > 2 ? this.images[1] : null;
        if (!image) {
            return null;
        }
        return image.url;
    }
    get fanartUrls() {
        const images = this.images.filter(i => i.url.match(/800x600/) === null);
        if (images.length === 0) {
            return null;
        }
        return images.map(i => i.url);
    }
}
exports.Page = Page;
class Lecture {
    constructor(value, page) {
        ({ title: this.title, id: this.id, description: this.description } = value);
        this._page = page;
    }
    get safeTitle() {
        return util_1.sanitize(this.title.replace(':', ` - `));
    }
    get episodeInfo() {
        const jsonObject = {
            episodedetails: {
                title: this.title,
                season: '01',
                episode: this.id,
                plot: this.description,
                playcount: '0',
                credits: 'Writer',
                director: 'Mr. Tard',
                aired: moment_1.default()
                    .add(parseInt(this.id), 'd')
                    .format('YYYY-MM-DD'),
                premiered: moment_1.default()
                    .add(parseInt(this.id), 'd')
                    .format('YYYY-MM-DD'),
                studio: 'TGC',
                mpaa: 'MPAA certification',
                actor: {
                    name: this._page.professor[0].name,
                    role: this._page.professor[0].bio,
                    thumb: this._page.professor[0].image
                },
                fileinfo: {
                    streamdetails: {}
                }
            }
        };
        return jstoxml_1.default.toXML(jsonObject, {
            header: true,
            indent: '    '
        });
    }
}
exports.Lecture = Lecture;
class Image {
    constructor(value) {
        this.url = value.url;
    }
}
exports.Image = Image;
class Professor {
    constructor(value) {
        ({ name: this.name, bio: this.bio, image: this.image } = value);
    }
    get actorInfo() {
        return {
            name: this.name,
            role: this.bio,
            thumb: this.image
        };
    }
}
exports.Professor = Professor;
//# sourceMappingURL=ledger.js.map