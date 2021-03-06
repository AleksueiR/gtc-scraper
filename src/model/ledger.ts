import moment from 'moment';
import jstoxml from 'jstoxml';

import { sanitize } from './../util';

// Generated by https://quicktype.io
//
// To change quicktype's target language, run command:
//
//   "Set quicktype target language"

export namespace Ledger {
    export interface Untyped {
        pages: Page.Untyped[];
    }
}

export namespace Page {
    export interface Untyped {
        title: string;
        description: string;
        rating: string;
        lectures: Lecture.Untyped[];
        images: Image.Untyped[];
        professor: Professor.Untyped[] | undefined;
        id: string;
    }
}
export namespace Image {
    export interface Untyped {
        url: string;
    }
}
export namespace Lecture {
    export interface Untyped {
        title: string;
        id: string;
        description: string;
    }
}
export namespace Professor {
    export interface Untyped {
        name: string;
        bio: string;
        image: string;
    }
}

export class Ledger {
    pages: Page[];

    constructor(value: Ledger.Untyped) {
        this.pages = value.pages.map((p) => new Page(p));
    }
}

export class Page {
    title: string;
    description: string;
    rating: string;
    lectures: Lecture[];
    images: Image[];
    professor: Professor[];
    id: string;

    constructor(value: Page.Untyped) {
        ({ title: this.title, description: this.description, rating: this.rating, id: this.id } = value);

        this.lectures = value.lectures.map((l) => new Lecture(l, this));
        this.images = value.images.map((i) => new Image(i));
        this.professor = (value.professor || []).map((p) => new Professor(p));
    }

    get safeTitle(): string {
        return sanitize(this.title.replace(':', ` - `));
    }

    get shortTitle(): string {
        let result = '';
        let num = 6;

        sanitize(this.title)
            .split(' ')
            .forEach((elm) => {
                result += (num > 0 && elm[0]) || '';
                num--;
            });

        return result;
    }

    get showInfo(): any {
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
                premiered: moment().format('YYYY-MM-DD'),
                aired: moment().format('YYYY-MM-DD'),
                studio: 'TGC',
                actor: this.professor.map((p) => p.actorInfo),
                resume: {
                    position: '0.000000',
                    total: '0.000000'
                }
                // "dateadded": "2013-01-28 23:33:03"
            }
        };

        return jstoxml.toXML(jsonObject, {
            header: true,
            indent: '    '
        });
    }

    get posterUrl(): string | null {
        // const image = this.images.find(i => i.url.match(/800x600/) !== null);
        // as a rule, cover image is always the second in the list; otherwise, there seem to be no naming convention for covers :/
        const image = this.images.length > 1 ? this.images[1] : null;
        if (!image) {
            return null;
        }

        return image.url;
    }

    get fanartUrls(): string[] | null {
        // const images = this.images.filter(i => i.url.match(/800x600/) === null);
        // as a rule, cover image is always the second in the list; otherwise, there seem to be no naming convention for covers :/
        const images = [...this.images];
        if (images.length > 1) {
            images.splice(1, 1);
        }

        if (images.length === 0) {
            return null;
        }

        return images.map((i) => i.url);
    }
}

export class Lecture {
    title: string;
    id: string;
    description: string;

    _page: Page;

    constructor(value: Lecture.Untyped, page: Page) {
        ({ title: this.title, id: this.id, description: this.description } = value);

        this._page = page;
    }

    get safeTitle(): string {
        return sanitize(this.title.replace(':', ` - `));
    }

    get episodeInfo(): any {
        const jsonObject = {
            episodedetails: {
                title: this.title,
                season: '01',
                episode: this.id,
                plot: this.description,
                playcount: '0',
                credits: 'Writer',
                director: 'Mr. Tard',
                aired: moment().add(parseInt(this.id), 'd').format('YYYY-MM-DD'),
                premiered: moment().add(parseInt(this.id), 'd').format('YYYY-MM-DD'),
                studio: 'TGC',
                mpaa: 'MPAA certification',
                actor: this._page.professor.length > 0 ? this._page.professor[0].actorInfo : undefined,
                fileinfo: {
                    streamdetails: {}
                }
            }
        };

        return jstoxml.toXML(jsonObject, {
            header: true,
            indent: '    '
        });
    }
}

export class Image {
    url: string;
    constructor(value: Image.Untyped) {
        this.url = value.url;
    }
}

export class Professor {
    name: string;
    bio: string;
    image: string;

    constructor(value: Professor.Untyped) {
        ({ name: this.name, bio: this.bio, image: this.image } = value);
    }

    get actorInfo(): object {
        return {
            name: this.name,
            role: this.bio,
            thumb: this.image
        };
    }
}
