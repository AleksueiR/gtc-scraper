var fs = require('fs-extra');
var p = require('path');
var Download = require('download');

// use  sudo apt-get install imagemagick to install image magic
var gm = require('gm').subClass({
    imageMagick: true
});

var gtc = require('./gtc');

module.exports.writeShowInfo = function(courseData, path) {
  return gtc
    .getCourseDetails(courseData)
    .then(function(data) {
        var show = data.lastReturn;
        
        fs.outputFileSync(path + '/' + show.getFileName(), show.toXML(), 'utf8');
        
        console.log(show.data.tvshow.title);
    });
};