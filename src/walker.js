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

var argv = require('minimist')(process.argv.slice(2));

var util = require('./util');

//console.log(argv);

module.exports.examine = function() {
    return new Promise(function(fulfill, reject) {
        ledger.getLedger(argv.s || argv.skipupdate)
            .then(function(ledgerData) {
                ledger = ledgerData;

                var dirs = walk.sync(argv._[0], {
                    no_recurse: true
                });

                console.log(sprintf('Found %s items:', dirs.length));

                async.eachSeries(dirs, function(dir, callback) {
                    //console.log('found sync:', dir, p.basename(dir), fs.statSync(dir).isDirectory());

                    if (fs.statSync(dir).isDirectory()) {
                        processShow(dir)
                            .then(function(record) {
                                return writer.writeShowInfo(record);
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
                    fulfill();
                });

            });
    });
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
                    name: sprintf('%s (%s)', match.name, match.score),
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
    // if force
    if (argv.f || argv.force) {
        return false;
    } else {

    return walk.sync(dir, {
        no_recurse: true
    }).some(function(currentValue, index, array) {
        return p.basename(currentValue) === 'tvshow.nfo';
    });
    }
}

function processShow(dir) {
    return new Promise(function(fulfill, reject) {

        var dirname = p.basename(dir);
        var dirnameSan = util.cleanString(dirname, '');
        console.log(sprintf('"%s":', dirname));

        if (checkTvshownfo(dir)) {
            console.log(sprintf('   Existing metadata found; skipping...', dirname));
            reject();
            return;
        }

        var matches = fuzzaldrin.filter(ledger, dirnameSan, {
            key: 'name',
            maxResults: 5
        }).map(function(match) {
            match.score = fuzzaldrin.score(match.name, dirnameSan);
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