// GLOBALS
var CANVAS_HEIGHT = 500,
	CANVAS_WIDTH = 800,
	TRACK_FREQUENCY = 50;

// Wait to get an ID before starting
socket.on("hello", function(data){
	$("#ID").text(data.id)
	$(".curtain").slideUp()
	gameStart(data.id)
});

function gameStart(pid) {
	var PLAYER_ID = pid;

	// SUBSCRIPTIONS
	socket.on("newplayer", function(data){
		console.log(data.msg)
	});
	socket.on("locupdate", function(data){
		var id_tag = "P:" + data.pid
		if (Crafty(id_tag).length == 0){   // If it doesn't exist, make it
			console.log("making new player")
			Crafty.e("2D, DOM, Color, Text")
			.color('rgb(255,0,0)')
			.attr({ x: data.x, y: data.y, w: 50, h: 50 })
			.text(id_tag)
			.addComponent(id_tag)
		} else {    // Otherwise update it
			Crafty(id_tag).x = data.x
			Crafty(id_tag).y = data.y
		}

	})

	// GAME LOGIC
	Crafty.init(CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById('game'));

	Crafty.c("LocTracker", {
	    init: function() {
	    	var count = 0
	    	var self = this;
	        this.bind('EnterFrame', function () {
	        	count++
	        	if (count > TRACK_FREQUENCY){
	        		count = 0;
	            	var loc = {
	            		'x': this.x,
	            		'y': this.y
	            	} 
	            	if (self.last_sent_x != self.x || self.last_sent_y != self.y ){
		                socket.emit("loc", loc, function(data){
			            	self.last_sent_x = self.x
			            	self.last_sent_y = self.y
		        			console.log("sent")
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


	Crafty.e("2D, DOM, Color, Fourway, LocTracker, Text, Player")
	.color('rgb(0,255,0)')
	.attr({ x: 580, y: 100, w: 50, h: 50 })
	.fourway(4);
	
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

