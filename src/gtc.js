var scraperjs = require('scraperjs');
var request = require('request');
var fs = require('fs');
var Promise = require('promise');

module.exports.getCategories = function() {
    var url = 'http://www.thegreatcourses.com/';

    return new Promise(function(fulfill, reject) {
        // scrape the main page for course categories
        scraperjs.StaticScraper
            .create(url)
            .scrape(function($) {

                var categories = $('.megamenu-list').first().find('a.level-top').map(
                    function() {
                        var category = $(this);
                        
                        return {
                            name: category.text().trim(),
                            url: category.attr('href')
                        };
                    }).get();

                return categories;
            }, function(data) {
                fulfill(data);
            });
    });
};

module.exports.scrapeCataloguePage = function(url) {
    return new Promise(function(fulfill, reject) {
        // scrape the main page and get the list of all course ids
        scraperjs.StaticScraper
            .create(url)
            .scrape(function($) {

                var rawText = $('.category-view script').last().text();
                var ids = /tgcJsNavProductIdsSorted = \["(.*)"\];/ig.exec(rawText)[1].split('","');

                //console.log(ids.length);

                return ids;
            }, function(data) {
                fulfill(data);
            });
    });
};

module.exports.getCourseInfo = function(ids) {
    return new Promise(function(fulfill, reject) {
        request.post({
                url: 'http://www.thegreatcourses.com/tgc_js_navigation/ajax/getProductsInfo/',
                form: {
                    ids: ids,
                    navigationData: '{"url":"http://www.thegreatcourses.com/courses","baseUrl":"http://www.thegreatcourses.com/courses"}'
                }
            },

            function(err, httpResponse, body) {

                if (err) {
                    console.log(err);
                    reject(err);
                }

                var coursesData = JSON.parse(body);
                fulfill(coursesData);
                
                /*fs.writeFile("courseids.json", JSON.stringify(coursesData, null, 4), function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!", ids.length, coursesData.length);
                });*/
            }
        );
    });
};