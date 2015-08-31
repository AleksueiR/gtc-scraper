var scraperjs = require('scraperjs');
var request = require('request');
var fs = require('fs');

// scrape the main page and get the list of all course ids
scraperjs.StaticScraper
    .create('http://www.thegreatcourses.com/courses')
    .scrape(function($) {

        var rawText = $('.category-view script').last().text();
        var ids = /tgcJsNavProductIdsSorted = \["(.*)"\];/ig.exec(rawText)[1].split('","')
        
        //console.log(ids.length);
        
        return ids;
    }, function(data) {
        //var temp = data.splice(0, 10);

        //console.log(data.splice(0, 10));

        //getStuff(temp);
        //console.log(data.length);
        getStuff(data);
    });

// send a fake post request to get course descriptions
function getStuff(ids) {
    request.post({
            url: 'http://www.thegreatcourses.com/tgc_js_navigation/ajax/getProductsInfo/',
            form: {
                ids: ids,
                navigationData: '{"url":"http://www.thegreatcourses.com/courses","baseUrl":"http://www.thegreatcourses.com/courses"}'
            }
        },

        function(err, httpResponse, body) {

            if (err) {
                return console.log(err);
            }

            var coursesData = JSON.parse(body);
            
            fs.writeFile("courseids.json", JSON.stringify(coursesData, null, 4), function(err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!", ids.length, coursesData.length);
            });

        }
    );
}