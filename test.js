var request = require('request');


request.post({url:'http://www.thegreatcourses.com/tgc_js_navigation/ajax/getProductsInfo/', 
    form: {
        ids: ['9968', '9313'],
        navigationData: '{"url":"http://www.thegreatcourses.com/courses","baseUrl":"http://www.thegreatcourses.com/courses"}'
    }}, 

function(err,httpResponse,body){  
    
    console.log(/*err, httpResponse,*/ JSON.parse(body)); 
    
    
})