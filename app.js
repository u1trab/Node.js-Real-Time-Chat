var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    ent = require('ent'),//Blocks HTML characters (for security)
    fs = require('fs');
	users = [];
	


// Το be fixed:
// User joined events: Users not shows up to the joined user until a new one joined

// Loading the page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket, username) {
	
    // When the username is received it’s stored as a session variable and informs the other people
    socket.on('new_client', function(username) {
        username = ent.encode(username);
        socket.username = username;
        socket.broadcast.emit('new_client', username);
		users.push(socket.username);
		console.log("----------------------------------------");
		console.log("User connected: " + socket.username);
        console.log("Online users: " + users.toString());
		console.log("----------------------------------------");
		updateUsers();
    });
	
    // Disconnect
    socket.on('disconnect', function(username){
		disMsg(socket.username);
		users.splice(users.indexOf(socket.username), 1);
		console.log("----------------------------------------");
		console.log("User disconnected: " + socket.username);
        console.log("Online users: " + users.toString());
		console.log("----------------------------------------");
		updateUsers();
    });
	function disMsg(username){
		socket.broadcast.emit('user_left', username);
		// ^ somehow if I put it to the socket.on('disconnect',xxxxxxx) it brakes everything 0_o
	}
	
    // When a message is received, the client’s username is retrieved and sent to the other people
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {username: socket.username, message: message});
    }); 
	
	// Update user list
    function updateUsers() {
        socket.broadcast.emit('get_users', users);
    }

	// Video
	socket.on('video call', function(data){
		socket.broadcast.emit('video call', data);
	});	
});


server.listen(process.env.PORT || 8080);
console.log("Server running...");
