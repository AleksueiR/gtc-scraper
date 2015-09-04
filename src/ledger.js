var gtc = require('./gtc');
var Promise = require('promise');
var find = require('array-find');

var outputJson = Promise.denodeify(require('fs-extra').outputJson);
var readJson = Promise.denodeify(require('fs-extra').readJson);

var sprintf = require("sprintf-js").sprintf;

var ledger;

function updateLedger(ids) {
    return gtc
        .getCourseInfo(ids)
        .then(function(data) {
            console.log('Retrieved course data.');

            ledger = data;

            return gtc.getCategories();
        })
        .then(function(categories) {
            var categoryScrapePromises;

            console.log('Retrieved category data.');

            categoryScrapePromises = categories
                .map(function(category) {
                    //console.log(category);
                    return gtc.scrapeCataloguePage(category.url);
                });

            return Promise
                .all(categoryScrapePromises)
                .then(function(data) {
                    console.log('Categorizing courses...');

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

            // assigning categories
            categories.forEach(function(category) {

                //console.log('Updating', category.name, 'category');

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

            console.log('Saving ledger...');
            outputJson('ledger.json', ledger, {spaces: 2}, 'utf8');

            return ledger;
        });
}

module.exports.getLedger = function(skipCheck) {
    return new Promise(function(fulfill, reject) {
        readJson('ledger.json')
            .catch(function() {
                console.log('Creating new ledger...');

                return gtc
                    .scrapeCataloguePage('http://www.thegreatcourses.com/courses')
                    .then(function(ids) {
                        console.log(sprintf('Found %s courses.', ids.length));
                        return updateLedger(ids);
                    })
                    .then(function() {
                        fulfill(ledger);
                    });
            })
            .then(function(data) {
                //ledger = JSON.parse(data);
                ledger = data;
                console.log(sprintf('Ledger contains %s records.', ledger.length));
                console.log('Checking for new GTC courses...');
                
                if (skipCheck) {
                    return fulfill(ledger);
                }
                
                return gtc.scrapeCataloguePage('http://www.thegreatcourses.com/courses')
                    .then(function(ids) {
                        if (ids.length === ledger.length) {
                            console.log('Ledger up-to date.');
                            fulfill(ledger);
                        }
                        else {
                            console.log(sprintf('%s courses found. Updating ledger...', ids.length));

                            return updateLedger(ids)
                                .then(function() {
                                    fulfill(ledger);
                                });
                        }
                    });
            });
    });
};