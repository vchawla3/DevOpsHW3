var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
  console.log(req.method, req.url);

  // ... INSERT HERE.
  if (req.url != "/favicon.ico")
  {
    client.lpush("recents", req.url, function(err, value)
    {
      client.ltrim("recents", 0, 4, function(err, value)
      {
        next(); 
      })
    });
  } else {
    next();
  }
  
  //client.expire("recents", 5);

   // Passing the request to the next handler in the stack.
});

app.get('/recents', function(req, res) {
  client.lrange("recents", 0, -1, function(err,value){ 
    console.log(value);
    res.send(value)
  });
})



app.get('/test', function(req, res) {
	{
		res.writeHead(200, {'content-type':'text/html'});
		res.write("<h3>test</h3>");
   	res.end();
	}
})



app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
			console.log(img);
			  
			client.lpush('cats', img, function(err)
			{

				res.status(204).end()
			});
		});
	}
}]);

app.get('/meow', function(req, res) {
  client.lpop("cats", function(err, value)
  {
    if (err) throw err
    res.writeHead(200, {'content-type':'text/html'});
    //items.forEach(function (imagedata) 
    //{
      res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+value+"'/>");
    //});
      res.end();
  });
})

function get_line(filename, line_no, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split("\n");

    if(+line_no > lines.length){
      throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
}

// Get the cat facts at num index, where 0 is the first cat
app.get('/catfact/:num', function(req, res) {
  var id = req.params.num;
  // create key string
  var keyString = 'catfact:' + id;
  client.get("toggleCache", function(err,value){ 
    //console.log(value);
    if (value == 1)
    {
      //it is toggled to ON
      client.exists(keyString, function(err,value){ 
          //console.log(value);
          var time = Date.now();
          //console.log(time);
          if (value == 1)
          {
            // key exists, retrieve and use it
            console.log('from redis');
            client.get(keyString, function(err,value)
            {
              if (err) throw err
              var timetook = Date.now() - time;
              res.writeHead(200, {'content-type':'text/html'});
              res.write("<h3>" + value + "</h3>");
              res.write("<h3> Time took: " + timetook + "</h3>");
              res.end();
            });
          } else 
          {
            //key does not exist, retrieve from disk(?) and then set key
            console.log('from disk');

            //Timeout set for Demonstration only, otherwise disk retrival is pretty fast and outputs 0
            setTimeout(function()
            {
                //alert("Hello");
                get_line('catfacts.txt', id, function(err, value)
                {
                  //cache it in the redis to get O(1) retrieval for the next ten seconds at least
                  client.set(keyString, value ,'EX', 10);
                  var timetook = Date.now() - time;
                  res.writeHead(200, {'content-type':'text/html'});
                  res.write("<h3>" + value + "</h3>");
                  res.write("<h3> Time took: " + timetook + "</h3>");
                  res.end();
                });
            }, 1000);
          }
      });
      
    } else 
    {
      //it is toggled to OFF
      get_line('catfacts.txt', id, function(err, value)
      {
        //cache it in the redis to get O(1) retrieval for the next ten seconds at least
        //client.set(keyString, value ,'EX', 10);
        res.writeHead(200, {'content-type':'text/html'});
        res.write("<h3>" + value + "</h3>");
        res.end();
      });
    }
  });
})


// Toggle the cache feature
app.get('/toggleCacheFeature', function(req, res) {

  client.get("toggleCache", function(err,value)
  {
    if (value == null || value == 0)
    {
      client.set("toggleCache", 1);
      res.send('Cache is toggled ON');g
    } else
    {
      client.set("toggleCache", 0);
      res.send('Cache is toggled OFF');
    }
  });
})


app.get('/get', function(req, res) {
  client.get("webb", function(err,value){ 
    console.log(value);
    if (value != null)
    {

      client.ttl("webb", function(err,val){ 
      console.log(val);
      res.send("Key: " + value + ". AND this will self destruct in " + val + " seconds");
     });
    } else 
    {
      res.send("Key is NULL");
    }
  });
})


app.get('/set', function(req, res) {
  client.set("webb", "this message will self-destruct in 10 seconds.",'EX', 10);
  res.send('key/value as been set');
})

// HTTP SERVER
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
