var moment = require('moment');
var Episode = require('./episode');
var extend = require('extend');
var jstoxml = require('jstoxml');
var util = require('./../util');
var os = require('os'),
    EOL = os.EOL;
var fs = require('fs-extra');

var _showTemplate = fs.readJsonSync('./src/model/show.json');

var Show = (function() {

    function Show(data) {
        var tvshow;
        var that = this;

        this.data = extend(true, {}, _showTemplate);
        this.episodes = [];
        this.images = {
            packageLarge: data.scrapedData.packageLarge,
            packageSmall: data.scrapedData.packageSmall,
            baseImages: data.scrapedData.baseImages
        };

        tvshow = this.data.tvshow;

        tvshow.title = util.sanitize(data.name.replace(':', ' -'));
        tvshow.showtitle = util.sanitize(data.name);
        tvshow.rating = data.scrapedData.rating;
        tvshow.votes = data.scrapedData.votes;
        //tvshow.year = ???;

        data.category.forEach(function (category) {
            tvshow.genre += '</genre>\n<genre>' + category;
        });

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
        //var showNameSan = sanitize(this.data.tvshow.title).trim();

        //return showNameSan + '/tvshow.nfo';
        return 'tvshow.nfo';
    };

    Show.prototype.getShowTitle = function() {
        return this.data.tvshow.title;
    };

    Show.prototype.getPosterFileName = function(prefix) {
        //var showName = this.data.tvshow.title;
        prefix = prefix || '';

        //return showName + '/' + prefix + 'poster.jpg';
        return prefix + 'poster.jpg';
    };

    Show.prototype.getFanartFileName = function(prefix) {
        //var showNameSan = sanitize(this.data.tvshow.title).trim();
        prefix = prefix || '';

        //return showNameSan + '/' + prefix + 'fanart.jpg';
        return prefix + 'fanart.jpg';
    };

    Show.prototype.getListingName = function() {
        //var showNameSan = sanitize(this.data.tvshow.title).trim();

        //return showNameSan + '/filenames.txt';
        return 'filenames.txt';
    };

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
