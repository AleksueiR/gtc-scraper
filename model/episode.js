var moment = require('moment');
var extend = require('extend');
var jstoxml = require('jstoxml');
var sanitize = require("sanitize-filename");

var _episodeTemplate = {
    "episodedetails": {
        "title": "My TV Episode",
        //"rating": "10.00",
        "season": "1",
        "episode": "1",
        "plot": "he best episode in the world",
        "thumb": "http://thetvdb.com/banners/episodes/164981/2528821.jpg",
        "playcount": "0",
        "credits": "Writer",
        "director": "Mr. Vision",
        "aired": "2000-12-31",
        "premiered": "2010-09-24",
        "studio": "TGC",
        "mpaa": "MPAA certification",
        //"epbookmark": "200",
        //"displayseason": "3",
        //"displayepisode": "4096",
        "actor": {
            "name": "Little Suzie",
            "role": "Pole Jumper/Dancer"
        },
        "fileinfo": {
            "streamdetails": {

            }
        }
    }
};

var Episode = (function() {
    //Episode.prototype.data = {};

    function Episode(count, data, showData) {
        var episode;

        this.data = extend(true, {}, _episodeTemplate);
        this.showData = showData;

        episode = this.data.episodedetails;

        episode.title = data.title;
        //episode.rating
        //episode.season = 1;
        episode.episode = count.toString();
        episode.plot = data.description;
        episode.thumb = showData.thumb_grid;
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

    Episode.prototype.getFileName = function(ext, bare) {
        var showNameSan = sanitize(this.showData.name).trim();
        var episodeNameSan = sanitize(this.data.episodedetails.title).trim();
        var seasonId = pad(this.data.episodedetails.season, 2);
        var episodeId = pad(this.data.episodedetails.episode, 2);

        ext = ext || '.nfo';
        bare = (typeof bare !== "undefined") ? bare : false;

        return (bare ? '' : showNameSan + '/Season ' + seasonId + '/') + shortenString(showNameSan, 6) + ' - s' + seasonId + 'e' + episodeId + ' - ' + episodeNameSan + ext;
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