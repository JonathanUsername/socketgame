// GLOBALS
var CANVAS_HEIGHT = 500,
	CANVAS_WIDTH = 800,
	TRACK_FREQUENCY = 5;

// Wait to get an ID before starting
socket.on("hello", function(data){
	$("#ID").text(data.id)
	$(".curtain").slideUp()
	gameStart(data.id, data.players)
});

function getPlayer(pid){
	return Crafty("P:" + pid)
}

function makeEnemy(data){
	var id_tag = "P:" + data.pid
	Crafty.e("2D, DOM, Color, Text, Enemy")
	.color('rgb(255,0,0)')
	.attr({ x: data.x, y: data.y, w: 50, h: 50 })
	.text(id_tag)
	.addComponent(id_tag)
}

function gameStart(pid, players) {
	var PLAYER_ID = pid;

	Crafty.init(CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById('game'));

	// Make existing players
	for (var i in players){
		makeEnemy(players[i])
	}

	// SUBSCRIPTIONS
	socket.on("newplayer", function(data){
		console.log(data.msg)
	});
	socket.on("playerleft", function(data){
		getPlayer(data.pid)
		.unbind("EnterFrame")
		.destroy()
	});
	socket.on("locupdate", function(data){
		var player = getPlayer(data.pid)
		if (player.length == 0){   // If it doesn't exist, make it
			console.log("making new player")
			makeEnemy(data)
		} else if (!player.has("Player")) {    // Otherwise update it if it's not ourself
			player.x = data.x
			player.y = data.y
		}

	})


	// GAME LOGIC
	Crafty.c("LocTracker", {
	    init: function() {
	    	var count = 0
	    	var self = this;
	        this.bind('EnterFrame', function () {
	        	count++
	        	if (count > TRACK_FREQUENCY){
	        		count = 0;
	        		// Only emit if moved
	            	if (self.last_sent_x != self.x || self.last_sent_y != self.y ){
		            	var loc = {
		            		'x': this.x,
		            		'y': this.y
		            	} 
		                socket.emit("loc", loc, function(data){
			            	self.last_sent_x = self.x
			            	self.last_sent_y = self.y
		        		});
	            	}
	        	}
	        });
	    }
	})

	Crafty.c("Player", {
	    init: function() {
    		this.addComponent("P:" + PLAYER_ID)
    		this.text(PLAYER_ID)
	    }
	})


	Crafty.e("2D, DOM, Color, Fourway, LocTracker, Text, Player, Collision")
	.color('rgb(0,255,0)')
	.attr({ x: 100 + Math.random() * (CANVAS_HEIGHT - 200), y:  100 + Math.random() * (CANVAS_WIDTH - 200), w: 50, h: 50 })
	.fourway(4)
	.bind('Moved', function(from) {
	    if(this.hit('Enemy')){
	        this.attr({x: from.x, y:from.y});
	    }
	})
}



//Ball
// Crafty.e("2D, DOM, Color, Collision")
//     .color('rgb(0,0,255)')
//     .attr({ x: 300, y: 150, w: 10, h: 10,
//             dX: Crafty.math.randomInt(2, 5),
//             dY: Crafty.math.randomInt(2, 5) })
//     .bind('EnterFrame', function () {
//         if (this.y <= 0 || this.y >= 290)
//             this.dY *= -1;
//         if (this.x > 600) {
//             this.x = 300;
//             Crafty("LeftPoints").each(function () {
//                 this.text(++this.points + " Points") });
//         }
//         if (this.x < 10) {
//             this.x = 300;
//             Crafty("RightPoints").each(function () {
//                 this.text(++this.points + " Points") });
//         }
//         this.x += this.dX;
//         this.y += this.dY;
//     })
//     .onHit('Paddle', function () {
//     this.dX *= -1;
// })

