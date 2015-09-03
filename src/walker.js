var inquirer = require("inquirer");

var walk = require('walkdir');
var p = require('path');

var fuzzaldrin = require('fuzzaldrin');

var Promise = require('promise');
var readFile = Promise.denodeify(require('fs').readFile);

var async = require('async');

var sprintf = require("sprintf-js").sprintf;

var writer = require('./writer');

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
            }).concat({ name: '[ Skip ]', value: -1})
        }, function(key) {
            fulfill(key);
        });
    });
}

readFile('ledger.json', 'utf8')
    .then(function(data) {
        var ledger = JSON.parse(data);

        return ledger;
    })
    .then(function(ledger) {

        var dirs = walk.sync(process.argv[2], {
            no_recurse: true
        });

        //console.log(dirs);

        async.eachSeries(dirs, function(dir, callback) {
            //console.log('found sync:', dir, p.basename(dir), fs.statSync(dir).isDirectory());

            var dirname = p.basename(dir);
            var matches = fuzzaldrin.filter(ledger, dirname, {
                key: 'name',
                maxResults: 5
            }).map(function(match) {
                match.score = fuzzaldrin.score(match.name, dirname);
                return match;
            });
            
            //console.log('a', matches); callback(); return;
            
            if (matches.length > 1) {
                askUser(dirname, matches)
                    .then(function() {
                        callback();
                    });
            }
            else if (matches.length === 0) {
                console.log(sprintf('"%s": Can\'t find a match; skipping...', dirname));
                callback();
            }
            else if (matches.length === 1 && matches[0].score < 0.08) {
                console.log(sprintf('"%s": Can\'t find a match; skipping... %s', dirname, matches[0].score));
                callback();
            }
            else {
                console.log(sprintf('"%s": Matched to "%s" (%s)', dirname, matches[0].name, matches[0].score));
                
                writer
                    .writeShowInfo(matches[0], dir)
                    .then(function() {
                        callback();
                    });
            }
        }, function(err) {
            console.log('done', err);
        });

    });
