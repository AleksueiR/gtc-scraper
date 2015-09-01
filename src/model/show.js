var moment = require('moment');
var Episode = require('./episode');
var extend = require('extend');
var jstoxml = require('jstoxml');
var sanitize = require("sanitize-filename");
var os = require('os'), EOL = os.EOL;

var _showTemplate = {
    "tvshow": {
        "title": "Show Title",
        "showtitle": "Show Title",
        "rating": "9.200000",
        "votes": "42",
        //"epbookmark": "0.000000",
        "year": "0",
        //"top250": "0",
        "season": "1",
        "episode": "176",
        "displayseason": "-1",
        "displayepisode": "-1",
        "plot": "Go deeper into the medical mysteries of House, TV's most compelling drama. Hugh Laurie stars as the brilliant but sarcastic Dr. Gregory House, a maverick physician who is devoid of bedside manner. While his behavior can border on antisocial, Dr. House thrives on the challenge of solving the medical puzzles that other doctors give up on. Together with his hand-picked team of young medical experts, he'll do whatever it takes in the race against the clock to solve the case.",
        "runtime": "0",
        "mpaa": "TV-14",
        "playcount": "0",
        'status': 'Ended',
        //"lastplayed": "1969-12-31",
        //"id": "73255",
        "genre": "Education", //[
        //"Lectures",
        //"Education"
        //],
        "premiered": "2004-11-16",
        "aired": "1969-12-31",
        "studio": "TGC",
        "actor": [{
            "name": "Hugh Laurie",
            "role": "Dr. Gregory House",
            "thumb": "http://thetvdb.com/banners/actors/23839.jpg"
        }],
        "resume": {
            "position": "0.000000",
            "total": "0.000000"
        },
        "dateadded": "2013-01-28 23:33:03"
    }
};

var Show = (function() {

    function Show(data) {
        var tvshow;
        var _episodes
        var that = this;

        this.data = extend(true, {}, _showTemplate);
        this.episodes = [];
        this.images = {
            packageLarge: data.scrapedData.packageLarge,
            packageSmall: data.scrapedData.packageSmall,
            baseImages: data.scrapedData.baseImages
        };

        tvshow = this.data.tvshow;

        tvshow.title = data.name;
        tvshow.showtitle = data.name;
        tvshow.rating = data.scrapedData.rating;
        tvshow.votes = data.scrapedData.votes;
        //tvshow.year = ???;

        tvshow.season = "1";
        tvshow.episode = data.scrapedData.lectures.length;

        tvshow.plot = data.scrapedData.description;
        tvshow.runtime = data.scrapedData.runtime;
        tvshow.premiered = moment.unix(data.news_from_date).format('YYYY-MM-DD');
        tvshow.aired = moment.unix(data.news_from_date).format('YYYY-MM-DD');
        //tvshow.studio = 

        tvshow.actor = [{
            'name': data.scrapedData.professor.name,
            'role': data.scrapedData.professor.role,
            'thumb': data.scrapedData.professor.thumb
        }];

        tvshow.dateadded = moment().format('YYYY-MM-DD hh:mm:ss');

        data.scrapedData.lectures.forEach(function(lecture, index) {
            var episode = new Episode(index + 1, lecture, data);
            that.episodes.push(episode);
        });
    }

    Show.prototype.toXML = function() {
        return jstoxml.toXML(this.data, {
            header: true,
            indent: '    '
        });
    };

    Show.prototype.getFileName = function() {
        var showNameSan = sanitize(this.data.tvshow.title).trim();

        return showNameSan + '/tvshow.nfo';
    };

    Show.prototype.getPosterFileName = function(prefix) {
        var showNameSan = sanitize(this.data.tvshow.title).trim();
        prefix = prefix || '';

        return showNameSan + '/' + prefix + 'poster.jpg';
    };

    Show.prototype.getFanartFileName = function(prefix) {
        var showNameSan = sanitize(this.data.tvshow.title).trim();
        prefix = prefix || '';

        return showNameSan + '/' + prefix + 'fanart.jpg';
    };

    Show.prototype.getNameSan = function() {
        var showNameSan = sanitize(this.data.tvshow.title).trim();

        return showNameSan;
    };

    Show.prototype.getListingName = function() {
        var showNameSan = sanitize(this.data.tvshow.title).trim();

        return showNameSan + '/filenames.txt';
    }

    Show.prototype.getEpisodeListing = function(ext) {
        var listing = '';

        ext = ext || '.mkv';

        this.episodes.forEach(function(episode) {
            listing += episode.getFileName(ext, true) + EOL;
        });

        return listing;
    };

    return Show;

})();

module.exports = Show;
