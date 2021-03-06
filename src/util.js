var sanitize = require("sanitize-filename");
var Download = require('download');
var Promise = require('promise');
// use  sudo apt-get install imagemagick to install image magic
var gm = require('gm').subClass({
    imageMagick: true
});
var p = require('path');

module.exports.sanitize = function(string, char) {
    char = char || '-';
    return sanitize(string).replace(/\u2013|\u2014/g, char).trim();
};

/**
 * Cleans the given string by replacing all the charcters except \w and ' ' with a specified char or ''.
 */
module.exports.cleanString = function(string, char) {
    char = char || '-';
    return string.replace(/[^\w ]/g, '');
};

module.exports.downloadFile = function(target, destination, callback) {
    return new Promise(function(fulfill, reject) {
        var folder = destination.substring(0, destination.lastIndexOf(p.sep));
        var fileName = destination.substring(destination.lastIndexOf(p.sep) + 1);

        //console.log('start download');

        new Download()
            .get(target)
            .dest(folder)
            .rename(fileName)
            .run(function() {
                if (callback) {
                    callback.call();
                }
                //console.log('finish download');
                fulfill();
            });
    });
};

module.exports.cropPoster = function(file) {
    return new Promise(function(fulfill, reject) {

        gm(file)
            .crop(417, 600, 192, 0)
            .write(file, function(err) {
                if (err) {
                    console.log('Error:', err);
                    reject();
                }
                else {
                    fulfill();
                }
            });
    });
}