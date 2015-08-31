var Show = require('./model/show');
var jstoxml = require('jstoxml');


//console.log(Show, Show.prototype);
var showa = new Show();
console.log(showa.data);


var xmlresult = jstoxml.toXML(showa.data, {
    header: true,
    indent: '  '
});

console.log(xmlresult);