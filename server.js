/*************************************
//
// socketgame app
//
**************************************/

var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');
var gameserver  = require('./gameserver');
var connect = require('express/node_modules/connect');
var parseCookie = connect.utils.parseCookie;
var MemoryStore = connect.middleware.session.MemoryStore;
var store;

var runningPortNumber = process.env.PORT;


app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');
	app.use(device.capture());
});

var DEV = true;

// logs every request
app.use(function(req, res, next){
	// output every request in the array
	if (DEV)
		console.log({method:req.method, url: req.url, device: req.device});
	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
	res.render('index');
});

io.sockets.on('connection', function (socket) {
	io.sockets.socket(socket.id).emit("hello", { id: socket.id });
	io.sockets.emit('newplayer', { msg:"New Player entered - " + socket.id });
	socket.on('loc', function(data, fn){
		data.pid = socket.id
		io.sockets.emit('locupdate', data);
		fn();//callback
	});
	socket.on('disconnect', function (data) {
		io.sockets.emit('playerleft', { pid: socket.id });
	});
});

server.listen(runningPortNumber);

