var gm = require('gm').subClass({
    imageMagick: true
});

/*gm(500, 500, '#ffffff')

.fontSize(68)
    .font('Palatino-Bold', 72)
    .drawText(-20, 98, "graphics magick")
    .write('drawing.png', function(err) {
        if (err) return console.dir(arguments)
        console.log(this.outname + ' created  :: ' + arguments[3])
    })*/

gm('sample/Experiencing Hubble Understanding the Greatest Images of the Universe/fanart.jpg')
    .resize(758)
    .size(function(err, size) {
        if (err) {
            console.log(err);
        }
        else {
            this.crop(758, 140, 0, size.height / 2 - 75)
                //.stroke('#000000', 2)

            .font('Palatino', 52)
                //.fontSize(60)

            .fill('#ffffff')
            .stroke('#000000', 2)
            //.fill('#000000')
            .drawText(10, size.height / 2 - 10, 'Experiencing Hubble Understanding the Greatest Images of the Universe')

            .stroke('#000000', 0)
                //.fill('#ffffff')
                .drawText(10, size.height / 2 - 10, 'Experiencing Hubble Understanding the Greatest Images of the Universe')

            //.drawCircle(10, 10, 20, 10)
            //.font('Arial')
            //.drawText(10, size.height / 2 , show.data.tvshow.title)
            .write('banner' + '_.jpg', function(err) {
                if (err) {
                    console.log('Error:', err);
                }
                else {
                    console.log(this.outname + ' created  :: ' + arguments[3]);
                }
            });
        }
    });