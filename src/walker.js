var inquirer = require("inquirer");

var walk = require('walkdir');
var p = require('path');

var fuzzaldrin = require('fuzzaldrin');

var Promise = require('promise');
var fs = require('fs-extra');

var async = require('async');

var sprintf = require("sprintf-js").sprintf;

var writer = require('./writer');
var ledger = require('./ledger');

module.exports.examine = function() {
    console.log(process.argv); // use to parse arguments: https://www.npmjs.com/package/minimist
};

// ask the user to pick a match or skip
function askUser(dirname, matches) {
    return new Promise(function(fulfill, reject) {
        inquirer.prompt({
            type: 'list',
            name: 'id',
            message: sprintf('Found several matches for "%s":', dirname),
            choices: matches.map(function(match, i) {
                return {
                    name: match.name, // + ' - ' + match.score,
                    value: i
                };
            }).concat({
                name: '[ Skip ]',
                value: -1
            })
        }, function(key) {
            fulfill(key);
        });
    });
}

function checkTvshownfo(dir) {
    return walk.sync(dir, {
        no_recurse: true
    }).some(function(currentValue, index, array) {
        return p.basename(currentValue) === 'tvshow.nfo';
    });
};

function processShow(dir) {
    return new Promise(function(fulfill, reject) {

        var dirname = p.basename(dir);
        console.log(sprintf('"%s":', dirname));

        if (checkTvshownfo(dir)) {
            console.log(sprintf('   Existing metadata found; skipping...', dirname));
            reject();
            return;
        }

        var matches = fuzzaldrin.filter(ledger, dirname, {
            key: 'name',
            maxResults: 5
        }).map(function(match) {
            match.score = fuzzaldrin.score(match.name, dirname);
            return match;
        });

        if (matches.length > 1) {
            askUser(dirname, matches)
                .then(function(key) {
                    if (key.id === -1) {
                        console.log(sprintf('   Skipping...'));
                        reject();
                    }
                    else {
                        fulfill({
                            dirname: dirname,
                            dir: dir,
                            match: matches[key.id]
                        });
                    }
                });
        }
        else if (matches.length === 0) {
            console.log(sprintf('   Can\'t find a match; skipping...'));
            reject();
        }
        else if (matches.length === 1 && matches[0].score < 0.08) {
            console.log(sprintf('   Can\'t find a match; skipping... %s', matches[0].score));
            reject();
        }
        else {
            console.log(sprintf('   Matched to "%s" (%s)', matches[0].name, matches[0].score));

            fulfill({
                dirname: dirname,
                dir: dir,
                match: matches[0]
            });
        }
    });
}

ledger.getLedger(true)
    .then(function(ledgerData) {
        ledger = ledgerData;

        var dirs = walk.sync(process.argv[2], {
            no_recurse: true
        });

        console.log(sprintf('Found %s items:', dirs.length));

        async.eachSeries(dirs, function(dir, callback) {
            //console.log('found sync:', dir, p.basename(dir), fs.statSync(dir).isDirectory());

            if (fs.statSync(dir).isDirectory()) {
                processShow(dir)
                    .then(function(record) {
                        return writer.writeShowInfo(record)
                    })
                    .then(function() {
                        console.log('');
                        callback();
                    })
                    .catch(function() {
                        console.log('');
                        callback();
                    });
            }
            else {
                callback();
            }


        }, function(err) {
            console.log('Scraping completed. Thank you.', err);
        });

    });
