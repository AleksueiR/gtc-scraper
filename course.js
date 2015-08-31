//var fs = require('fs');
var fs = require('fs-extra');
var scraperjs = require('scraperjs');
var Show = require('./model/show');
var rimraf = require('rimraf');
var Download = require('download');
// use  sudo apt-get install imagemagick to install image magic
var gm = require('gm').subClass({
    imageMagick: true
});

fs.readFile('courseids.json', function(err, data) {
    if (err) throw err;
    var jsdata = JSON.parse(data);
    var counter = 0;
    var baseFolder = 'courses/';

    //console.log(jsdata.length);

    jsdata.splice(0, 30).forEach(function(iddata) {

        getCourseDetail(iddata.url)
            .then(function(data) {
                iddata.scrapedData = data.lastReturn;

                var show = new Show(iddata);

                //console.log(data.lastReturn.packageLarge);
                //console.log(data.lastReturn.baseImages);

                console.log(show.data.tvshow.title, " processing ...");

                // create course folder
                rimraf(baseFolder + show.getFileName(), function() {
                    fs.outputFileSync(baseFolder + show.getFileName(), show.toXML());
                    fs.outputFileSync(baseFolder + show.getListingName(), show.getEpisodeListing());

                    show.episodes.forEach(function(episode) {
                        fs.outputFileSync(baseFolder + episode.getFileName(), episode.toXML());
                    });

                    //console.log(show.images.packageLarge);

                    // get poster image, crop it and multiply
                    downloadFile(show.images.packageLarge, baseFolder + show.getPosterFileName(),
                        function() {
                            gm(baseFolder + show.getPosterFileName())
                                .crop(417, 600, 192, 0)
                                .write(baseFolder + show.getPosterFileName(), function(err) {
                                    if (err) {
                                        console.log('Error:', err);
                                    }
                                    else {

                                        fs.copySync(baseFolder + show.getPosterFileName(), baseFolder + show.getPosterFileName('season01-'));
                                        fs.copySync(baseFolder + show.getPosterFileName(), baseFolder + show.getPosterFileName('season-all-'));
                                    }
                                });
                        });

                    // get fanart image, crop it and multiply
                    if (show.images.baseImages.length > 0) {
                        downloadFile(show.images.baseImages[0], baseFolder + show.getFanartFileName(),
                            function() {
                                fs.copySync(baseFolder + show.getFanartFileName(), baseFolder + show.getFanartFileName('season01-'));
                                fs.copySync(baseFolder + show.getFanartFileName(), baseFolder + show.getFanartFileName('season-all-'))


                                // trying to make a banner here
                                /*
                                gm(baseFolder + show.getFanartFileName())
                                    .resize(758)
                                    .size(function(err, size) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            this.crop(758, 140, 0, size.height / 2 - 75)
                                                //.stroke('#000000', 2)
                                                
                                                .font('Palatino-Bold', 72)
                                                //.fontSize(60)
                                                
                                                .fill('#ffffff')
                                                .stroke('#000000', 2)
                                                //.fill('#000000')
                                                .drawText(10, size.height / 2 - 10, show.data.tvshow.title)
                                                
                                                .stroke('#000000', 0)
                                                //.fill('#ffffff')
                                                .drawText(10, size.height / 2 - 10 , show.data.tvshow.title)
                                                
                                                //.drawCircle(10, 10, 20, 10)
                                                //.font('Arial')
                                                //.drawText(10, size.height / 2 , show.data.tvshow.title)
                                                .write(baseFolder + show.getFanartFileName() + '_.jpg', function(err) {
                                                    if (err) {
                                                        console.log('Error:', err);
                                                    }
                                                    else {
                                                        console.log(this.outname + ' created  :: ' + arguments[3])
                                                    }
                                                });
                                        }
                                    });*/
                            });
                    }
                    counter++;
                    console.log(show.data.tvshow.title, " was saved!", counter);
                });
            });

    })
});


function getCourseDetail(url) {
    return scraperjs.StaticScraper.create(url)
        .scrape(function($) {
            var data = {};

            data.lectures = $('.lectures-container').first().find('.lectures-list li').map(function() {
                return {
                    title: $(this).find('.lecture-title').text(),
                    description: $(this).find('.lecture-description-block').contents().first().text().trim(),
                };
            }).get();

            data.rating = $('span[itemprop="ratingValue"]').first().text().trim();
            data.votes = $('meta[itemprop="reviewCount"]').first().attr('content');

            data.description = $('#course-description-truncated').text().trim();
            data.runtime = $('.course-counters span').last().text().split(' ')[0];

            data.professor = {
                name: $('.your-professor-container .professor-name').text().trim(),
                role: $('.your-professor-container .professor-post').text().trim(),
                thumb: $('.your-professor-container .big-photo > img').attr('src')
            };

            data.packageSmall = $('.main-container .product-image-block > img').first().attr('src');
            data.packageLarge = data.packageSmall.replace('thumbnail/150x210', 'image/800x600');
            data.baseImages = $('a.cloud-zoom-gallery').map(function() {
                return $(this).attr('href');
            }).get();

            return data;
        }, function(data) {
            //console.log(data);
            return data;
        });
}

function downloadFile(target, destination, callback) {
    var folder = destination.substring(0, destination.lastIndexOf('/'));
    var fileName = destination.substring(destination.lastIndexOf('/') + 1);

    //console.log(destination, folder, fileName);

    new Download()
        .get(target)
        .dest(folder)
        .rename(fileName)
        .run(function() {
            if (callback) {
                callback.call();
            }
        });
}

function writeFile() {


}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}