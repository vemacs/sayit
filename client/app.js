var _ 			= require('underscore');
var $			= require('jquery');
var io 			= require('socket.io-client');
var Handlebars  = require('handlebars');
var moment 		= require('moment');

$().ready(function() {

	var socket = io.connect(location.protocol + '//' + location.host);

	var messageTemplate = Handlebars.compile($('#message-template').html());

	$('#message-post').keyup(function(e) {
		// enter key
		if (e.keyCode === 13) {
			var text = $(this).val().trim();

			if (!text) {
				return;
			}

			$(this).val('');

			socket.emit('post message', text);
		}
	});

	socket.on('messages', function(messages) {
		$('#messages').html('');
		_.each(messages, function(message) {
			$('#messages').prepend(messageTemplate({
				text: message.text,
				color: message.color,
				timeSincePosted: moment(message.createdAt).format('lll'),
			}));
		});
	});

	socket.on('new message', function(message) {
		if ($('messages').children().length > 100) {
			$('#messages').children().last().remove();
		}
		$('#messages').prepend(messageTemplate({
			text: message.text,
			color: message.color,
			timeSincePosted: moment(message.createdAt).format('lll'),
		}));
	});

	socket.on('disabled', function(disabled) {
		$('#message-post').prop('disabled', disabled);

		if (disabled) {
			$('#message-post').prop('placeholder', "You've been muted temporarily due to spamming.");
		} else {
			$('#message-post').prop('placeholder', "Say it!");
		}
	});

	socket.on('users connected', function(count) {
		console.log(count);
		$('#users-connected').html(count);
	});

});