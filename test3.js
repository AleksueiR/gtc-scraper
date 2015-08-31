var gm = require('gm').subClass({
    imageMagick: true
});

gm(500, 500, '#ffffff')
  .fontSize(68)
  .drawText(-20, 98, "graphics magick")
  .write('drawing.png', function(err){
    if (err) return console.dir(arguments)
    console.log(this.outname + ' created  :: ' + arguments[3])
  }
) 