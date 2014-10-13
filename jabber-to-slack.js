var xmpp = require('simple-xmpp');
var request = require('request');
var config = require('config-heroku');

var jid = config.get('xmpp.jid');
var password =  config.get('xmpp.password');
var host = config.get('xmpp.host');
var port =  config.get('xmpp.port');
var conferenceserver =config.get('xmpp.conferenceserver');
var botname = config.get('botname');
var slacktoken = config.get('slack-token');
var rooms = config.get('rooms');

xmpp.connect({
            jid: jid,
            password: password,
            host: host,
            port: port
});

xmpp.on('error', function(err) {
        console.error(err);
});

xmpp.on('online', function(data) {
    console.log('Connected with JID: ' + data.jid.user);
    for (var roomname in rooms){
        join_room(roomname);
    }
});

function join_room(roomname) {
    var room = roomname + '@' + conferenceserver;
    var to = room + '/' + botname;
    xmpp.join(to);
    console.log('Joined channel "%s"', room);
}

xmpp.on('groupchat', function(conference, from, message, stamp) {
        var parts = conference.split('@', 1);
        var room = parts[0];
        var channel = rooms[room];
        if (!stamp && channel) {
            // Only log non hitory messages
            send('chat.postMessage', {
                channel: channel,
                text: message,
                username: from,
                parse: 'full',
                link_names: 0,
                unfurl_links: 1
            });
        }
});


function send (method, args) {
    args = args || {} ;
    args.token = slacktoken,
    request.post({
        url: 'https://slack.com/api/' + method,
        json: true,
        form: args
    }, function (error, response, body) {
        if (error || !body.ok) {
            console.log('Error:', error || body.error);
        }
    });
};
