var _ = require('underscore');
var express = require('express');
var gen = require('random-seed');
var escape = require('escape-html');
var URL = require('url');
var getUrls = require('./lib/get-urls');
var JsonMessageStore = require('./lib/json-message-store');

process.chdir(__dirname);

var messageStore = new JsonMessageStore('./messages.json');

var app = express();
app.use(express.static('./public'));

var server = app.listen(parseInt(process.env.SAYIT_PORT) || 42069);

var io = require('socket.io')(server);

var messageCounter = {};
var recentImageUrls = [];
var recentComments = [];
var blockList = [];

setInterval(function() {
    recentComments = [];
    recentImageUrls = [];
    io.emit('disabled', false);
}, 1000 * 15);

setInterval(function() {
    messageCounter = {};
}, 1000 * 30);

/**
 * Generate a color from a Socket.IO id.
 * @param {string} id
 */
function getColorFromId(id) {
    var rng = gen.create(id);
    return '#' + rng(0xAAAAAA).toString(16);
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

io.on('connection', function(socket) {

    console.log(socket.id, 'connected from', socket.handshake.address);

    socket.emit('messages', messageStore.allMessages());

    io.emit('users connected', Object.keys(io.sockets.adapter.rooms).length);

    socket.on('post message', function(text) {
        if (!text) {
            return;
        }

        var addr = socket.id;

        messageCounter[addr] = messageCounter[addr] || 0;
        messageCounter[addr] ++;

        if (messageCounter[addr] >= 25) {
            socket.emit('disabled', true);
            console.log(socket.id, 'blocked');
            return;
        }

        console.log(socket.id + ':', text);

        // limit text length
        text = text.slice(0, 80);

        if (text.substring(0, 'hue'.length) == 'hue') return;

        // escape html
        text = escape(text);

        if (text.length < 6) return;
        if (text.replace(/\s/g, '').match(/^[0-9]+$/) != null) return;

        // kappa
        text = text.replace('Kappa', '<img src="/img/kappa.gif" class="img-emote">');

        // frankerz
        text = text.replace('FrankerZ', '<img src="/img/frankerz.png" class="img-emote">');

        // basic antispam of same message
        if (_.contains(recentComments, text)) {
            return;
        } else {
            recentComments.push(text);
        }

        if (!isASCII(text)) return;

        // linkify urls
        _.each(_.uniq(getUrls(text)), function(url) {
            if (/\.(jpe?g|png|bmp|gif)$/i.test(url)) {
                url = url.split('?')[0];
                if (_.contains(recentImageUrls, url)) {
                    return;
                }
                if (/\.(gif)$/i.test(url)) {
                    text = text.replace(url, '<a href="' + url + '" target="_blank" class="link-img"><img src="' + url + '" class="img-message"></a>');
                } else {
                    text = text.replace(url, '<a href="' + url + '" target="_blank" class="link-img"><img src="http://api.rethumb.com/v1/width/320/' + url.replace('https', 'http') + '" class="img-message"></a>');
                }
                recentImageUrls.push(url);

            } else {
                text = text.replace(url, '<a href="' + url + '" target="_blank">' + URL.parse(url).host + '</a>');
            }
        });

        var newMessage = {
            text: text,
            color: getColorFromId(socket.id),
            createdAt: new Date(),
        };

        messageStore.add(newMessage);

        io.emit('new message', newMessage);
    });

    socket.on('disconnect', function() {
        io.emit('users connected', Object.keys(io.sockets.adapter.rooms).length);

        console.log(socket.id, 'disconnected');
    });

});
