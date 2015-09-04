var scraperjs = require('scraperjs');
var request = require('request');
var fs = require('fs-extra');
var Promise = require('promise');

var Show = require('./model/show');

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
            }
        );
    });
};

module.exports.getCourseDetails = function(courseData) {
    return new Promise(function(fulfill, reject) {
        scraperjs.StaticScraper.create(courseData.url)
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
                courseData.scrapedData = data;

                fulfill(new Show(courseData));
            });
    });
};