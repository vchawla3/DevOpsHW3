Cache, Proxies, Queues
=========================

### Conceptual Questions

1. Some benefits of Feature Flags are that they provide an easy way to test new features on production servers to get actual results on how stable the code is. By using them, developers can easily roll out or roll back features in development.
Some issues include that building up a lot of features with flags can easily create a lot of technical debt. Also, if some feature are dependent on others, than turning off one feature may have a cascading effect and break multiple features.

2. Some reasons to keep servers in different availability zones may be to improve latency. If the servers are geographically closer to where they are being used, then latency is better. Also, different zones help safeguard from any issues with failures and downtimes.
If a company has redundant servers in various zones, then if one goes down, traffic can easily be redirected to the other. The different zones may also be to handle different laws in different countries.

3. The purpose of the Circuit Breaker pattern is to prevent problems and failures that occur in one part of the software/service from cascading into other parts. 
The 'circuit breaker' gets tripped when multiple consecutive failures occur. Once it is tripped, the entire service is basically shutdown for a period of time. If anything tries to invoke it, an error will occur, which is then ideally handled by the invoker.
Operation toggles are similar in the idea that they turn on and off different system abilities. The key difference between the two is that operation toggles are manually toggled by users, while the circuit breaker pattern is tripped and shuts down then restarts the service/feature automatically.

4.
   - a) A system with traffic that peaks on Monday evenings could have server instances readily deployed that only allow traffic on Monday evenings. This way every Monday evening, the application can handle higher usage.
   
   - b) A system with real time and concurrent connections with peers can distribute the load by putting connections across multiple threads as well as multiple servers so one server does not get overloaded. 
   
   - c) A system with heavy upload traffic can be sped up using a load balancer to auto scale new instances once many upload requests start hitting the application. Improving bandwidth from the applications ISP by having a high Quality of Service requirement. A CDN located on different sites can also improve performance. 

### Screencast

[Here](https://youtu.be/fotCwrBk7oA)

Some notes
   - When cache feature is toggled ON, if it retrieves from disk, there is a timeout set for 1 second on the getLine method, so it shows it takes longer for demonstration purposes.
   - When cache feature is toggled OFF, the time it took is not displayed
   - For 'catfact/:num', the num parameter returns the num catfact starting from 0 index (so if num = 0, the first catfact will be returned). This could easily be modified if we wanted num = 1 to return the first catfact, by just decrementing the parameter in the function.
   - The recents list does not include /favicon.ico because my browser kept making requests for it so I never add it to the list.

WorkShop Details
=========================
### Setup

* Clone this repo, run `npm install`.
* Install redis and run on localhost:6379

### A simple web server

Use [express](http://expressjs.com/) to install a simple web server.

	var server = app.listen(3000, function () {
	
	  var host = server.address().address
	  var port = server.address().port
	
	  console.log('Example app listening at http://%s:%s', host, port)
	})

Express uses the concept of routes to use pattern matching against requests and sending them to specific functions.  You can simply write back a response body.

	app.get('/', function(req, res) {
	  res.send('hello world')
	})

### Redis

You will be using [redis](http://redis.io/) to build some simple infrastructure components, using the [node-redis client](https://github.com/mranney/node_redis).

	var redis = require('redis')
	var client = redis.createClient(6379, '127.0.0.1', {})

In general, you can run all the redis commands in the following manner: client.CMD(args). For example:

	client.set("key", "value");
	client.get("key", function(err,value){ console.log(value)});

### An expiring cache

Create two routes, `/get` and `/set`.

When `/set` is visited, set a new key, with the value:
> "this message will self-destruct in 10 seconds".

Use the expire command to make sure this key will expire in 10 seconds.

When `/get` is visited, fetch that key, and send value back to the client: `res.send(value)` 


### Recent visited sites

Create a new route, `/recent`, which will display the most recently visited sites.

There is already a global hook setup, which will allow you to see each site that is requested:

	app.use(function(req, res, next) 
	{
	...

Use the lpush, ltrim, and lrange redis commands to store the most recent 5 sites visited, and return that to the client.

### Cat picture uploads: queue

Implement two routes, `/upload`, and `/meow`.
 
A stub for upload and meow has already been provided.

Use curl to help you upload easily.

	curl -F "image=@./img/morning.jpg" localhost:3000/upload

Have `upload` store the images in a queue.  Have `meow` display the most recent image to the client and *remove* the image from the queue. Note, this is more like a stack.

### Proxy server

Bonus: How might you use redis and express to introduce a proxy server?

See [rpoplpush](http://redis.io/commands/rpoplpush)
