$(document).ready(function () {
    $.ajax({
        url:"https://api.yelp.com/oauth2/token",
        type:"post",
        data:{"grant_type":"client_credentials","client_id":"9JLuPj0Bgr4lcyY3csZ9RQ","client_secret":"BEfoMpT79CHGqkZkSJ35zyc3Qzdd2l1zGT5NwMUpbqmMWngB2VmNvkpMzft9s9hr"},
        dataType:"JSONP",
        // crossDomain: true,
        // headers:{"Access-Control-Allow-Origin": "*"},
        // success:function (data) {
        //     console.log(JSON.parse(data));
        // }
    });
    // getKey;
});