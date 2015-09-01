var request = require('request');
var fs = require('fs-extra');
var find = require('array-find');

/*request.post({url:'http://www.thegreatcourses.com/tgc_js_navigation/ajax/getProductsInfo/', 
    form: {
        ids: ['9968', '9313'],
        navigationData: '{"url":"http://www.thegreatcourses.com/courses","baseUrl":"http://www.thegreatcourses.com/courses"}'
    }}, 

function(err,httpResponse,body){  
    
    console.log(JSON.parse(body)); 
    
    
})*/

fs.readFile('ledger.json', function(err, data) {
    if (err) {
        throw err;
    } else {
        var jsdata = JSON.parse(data);
        
        var co = find(jsdata, function(d) {
            return d.category.length === 0;
        })
        
        console.log(co);
    }
});
