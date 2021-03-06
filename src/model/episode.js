var moment = require('moment');
var extend = require('extend');
var jstoxml = require('jstoxml');
var util = require('./../util');
var p = require('path');
var sprintf = require("sprintf-js").sprintf;
var fs = require('fs-extra');

var _episodeTemplate = fs.readJsonSync('./src/model/episode.json');

var Episode = (function() {
    //Episode.prototype.data = {};

    function Episode(count, data, showData) {
        var episode;

        this.data = extend(true, {}, _episodeTemplate);
        this.showData = showData;

        episode = this.data.episodedetails;

        episode.title = util.sanitize(data.title);
        //episode.rating
        //episode.season = 1;
        // round episode number to two digits; might need to update this to handle number of episodes > 99
        episode.episode = sprintf('%02d', count.toString());
        episode.plot = data.description;
        //episode.thumb = showData.thumb_grid;
        episode.aired = moment.unix(showData.news_from_date).add(count, 'd').format('YYYY-MM-DD');
        episode.premiered = moment.unix(showData.news_from_date).format('YYYY-MM-DD');

        episode.actor = [{
            'name': showData.scrapedData.professor.name,
            'role': showData.scrapedData.professor.role,
            'thumb': showData.scrapedData.professor.thumb
        }];
    }

    Episode.prototype.toXML = function() {
        return jstoxml.toXML(this.data, {
            header: true,
            indent: '    '
        });
    };

    Episode.prototype.getEpisodeNumber = function() {
        return this.data.episodedetails.episode;
    };

    Episode.prototype.getSeasonNumber = function() {
        return this.data.episodedetails.season;
    };

    Episode.prototype.getFileName = function(ext, bare) {
        var showName = this.showData.name;
        var episodeTitle = this.data.episodedetails.title;
        var seasonId = this.data.episodedetails.season;
        var episodeId = this.data.episodedetails.episode;


        ext = ext || '.nfo';
        bare = (typeof bare !== "undefined") ? bare : false;

        return sprintf('Season %s%s%s - s%se%s - %s%s', seasonId, p.sep, shortenString(showName, 6), seasonId, episodeId, episodeTitle, ext);

        //return (bare ? '' : showNameSan + '/Season ' + seasonId + '/') + shortenString(showNameSan, 6) + ' - s' + seasonId + 'e' + episodeId + ' - ' + episodeNameSan + ext;
    };

    return Episode;

})();

module.exports = Episode;


function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function shortenString(arg, num) {
    var result = "",
        num = num || 9999;
    arg
        .split(" ")
        .forEach(function(elm, i) {
            result += (num > 0 && elm[0]) || "";
            num--;
        })

    return result;
};