var fs = require('fs-extra');
var p = require('path');
var sprintf = require("sprintf-js").sprintf;

var walk = require('walkdir');
var async = require('async');
var Promise = require('promise');
var find = require('array-find');

var gtc = require('./gtc');
var util = require('./util');

var argv = require('minimist')(process.argv.slice(2));

module.exports.writeShowInfo = function(record) {

    console.log(sprintf('   Removing old metadata...'));
    walk.sync(record.dir)
        .forEach(function(file) {
            //console.log(file, p.extname(file));
            if (p.extname(file) === '.nfo') {
                fs.removeSync(file);
            }
        });

    return gtc
        .getCourseDetails(record.match)
        .then(function(data) {
            var show = data;

            var episodeFiles = walk.sync(record.dir)
                .filter(function(file) {
                    return p.extname(file) === '.mkv';
                });
            var basefolder = record.dir + p.sep;

            // output tvinfo.nfo file
            console.log(sprintf('   Writing metadata...'));
            fs.outputFileSync(basefolder + show.getFileName(), show.toXML(), 'utf8');

            return processEpisodes(show, episodeFiles, basefolder)
                .then(function() {
                    console.log(sprintf('   Fetching images...'));

                    //console.log('poster');

                    return getPoster(show, basefolder);
                })
                .then(function() {
                    //console.log('fanart');
                    return getFanart(show, basefolder);
                })
                .then(function() {
                    //console.log('move');
                    return moveShow(record.dir, p.dirname(record.dir) + p.sep + show.getShowTitle());
                });

        })
        .then(function() {
            console.log('All done.');
        });
};

function processEpisodes(show, episodeFiles, basefolder) {
    return new Promise(function(fulfill, reject) {
        async.eachSeries(show.episodes, function(episode, callback) {

            //console.log(episode);

            //show.episodes.forEach(function(episode) {
            var episodeFile = find(episodeFiles, function(file) {
                var reg = new RegExp('\\b(s\\d+)?e?' + episode.getEpisodeNumber() + '\\b', 'ig');
                //console.log(p.basename(file), reg.test(p.basename(file)), reg);
                return reg.test(p.basename(file));
            });

            if (episodeFile) {
                var newEpisodeFile;
                var episodeNfoFile;

                if (argv.r || argv.rename) {
                    newEpisodeFile = basefolder + episode.getFileName(p.extname(episodeFile));
                    episodeNfoFile = basefolder + episode.getFileName();
                }
                else {
                    episodeNfoFile = basefolder + p.basename(episodeFile, p.extname(episodeFile)) +  '.nfo';
                    //console.log(episodeNfoFile);
                }
                fs.outputFileSync(episodeNfoFile, episode.toXML(), 'utf8');

                //move episode files
                if (newEpisodeFile && !fs.existsSync(newEpisodeFile)) {
                    //fs.move(episodeFile, newEpisodeFile, {}, function(err) {
                    fs.rename(episodeFile, newEpisodeFile, function(err) {
                        if (err) {
                            console.error(err);
                        }
                        callback();
                    });
                }
                else {
                    callback();
                }
            }
            else {
                callback();
            }
            //});
        }, function(err) {
            if (err) {
                console.error(err);
            }
            console.log(sprintf('   All episodes are processed.'));
            fulfill();
        });
    });
}

function getPoster(show, basefolder) {
    // get poster image, crop it and multiply
    return util.downloadFile(show.images.packageLarge, basefolder + show.getPosterFileName())
        .then(function() {
            return util.cropPoster(basefolder + show.getPosterFileName());
        })
        .then(function() {

            fs.copySync(basefolder + show.getPosterFileName(), basefolder + show.getPosterFileName('season01-'));
            fs.copySync(basefolder + show.getPosterFileName(), basefolder + show.getPosterFileName('season-all-'));
            //console.log('poster done');
        });
}

function getFanart(show, basefolder) {
    // get fanart image and multiply
    if (show.images.baseImages.length > 0) {
        return util.downloadFile(show.images.baseImages[0], basefolder + show.getFanartFileName())
            .then(function() {
                fs.copySync(basefolder + show.getFanartFileName(), basefolder + show.getFanartFileName('season01-'));
                fs.copySync(basefolder + show.getFanartFileName(), basefolder + show.getFanartFileName('season-all-'));

                //console.log('fanart done');
            });
    }
}

function moveShow(src, dest) {
    // moving base folder
    // https://stackoverflow.com/questions/8579055/how-i-move-files-on-node-js/29105404#29105404
    //console.log('moving')
    if ((argv.r || argv.rename) && !fs.existsSync(dest)) {

        return new Promise(function(fulfill, reject) {
            fs.rename(src, dest, function() {
                //console.log('move done');
                fulfill();
            });

            /*fs.move(src, dest, function() {
                console.log('move done');
                fulfill();
            });*/
        });
    }
}