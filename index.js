var gtc = require('./src/gtc');
var Promise = require('promise');
var find = require('array-find');
var fs = require('fs-extra');

// send a fake post request to get course descriptions
function getStuff(ids) {}

var ledger;

gtc
    .scrapeCataloguePage('http://www.thegreatcourses.com/courses')
    .then(function(ids) {
        console.log('Retrieved all ids', ids.length);

        return gtc.getCourseInfo(ids);
    })
    .then(function(data) {
        console.log('Retrieved all course data');

        ledger = data;

        return gtc.getCategories();
    })
    .then(function(categories) {
        var categoryScrapePromises;

        console.log('Retrieved all categories');

        categoryScrapePromises = categories
            .map(function(category) {
                //console.log(category);
                return gtc.scrapeCataloguePage(category.url);
            });

        return Promise
            .all(categoryScrapePromises)
            .then(function(data) {
                console.log('Retrieved all ids by category');

                data.forEach(function(section, i) {
                    categories[i].ids = section;
                    //console.log(piece.length, i);
                });
                //console.log(data.length);

                return categories;
            });
    })
    .then(function(categories) {
        //console.log(categories);

        categories.forEach(function(category) {

            console.log('Updating', category.name, 'category');

            category.ids.forEach(function(id) {

                //console.log('looing for', id);

                var course = find(ledger, function(c) {
                    //console.log(c.id, id, c.id === id);
                    return c.id === id;
                });

                if (course) {
                    course.category = course.category || [];
                    course.category.push(category.name);
                    //console.log(course.name);
                }

            });

        });
        
        fs.outputFileSync('ledger.json', JSON.stringify(ledger, null, 4), 'utf8');

    });