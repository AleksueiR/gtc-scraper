var gm = require('gm').subClass({
    imageMagick: true
});

gm('poster.jpg')
    .crop(417, 600, 192, 0)
    .write('_test.jpg' /* + show.images.packageLarge*/ , function(err) {
        if (!err) console.log('crazytown has arrived');
        
        console.log(err);
    });