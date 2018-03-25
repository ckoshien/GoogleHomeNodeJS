var http = require('http');
const fs = require('fs');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
VoiceText = require ('voicetext');
qs = require('querystring');
var POST='';
var str='';
var OUTPUT_URL = '<>/wav';

const lang = 'ja-JP';

const speed = 100;

const ip = '<google home ip address>';
http.createServer(function (req, res) {
    var body='';
    switch(req.url){
       case '/notify':
        console.log('notify');
        if(req.method='POST'){
            //var body='';
            req.on('data', function (data) {
                body +=data;
            });
            req.on('end',function(){
               
               POST =  qs.parse(body);
               if(typeof POST['text']!=='undefined'){
                makeAudio(POST);
                say(ip, OUTPUT_URL);
             }
               console.log(POST);
            });
             
             POST='';
             res.end();
        }   
        break;
      case '/wav':
        res.writeHead(200, {'content-type':'audio/wav'});
        fs.createReadStream('./test.wav').on('error', resError).pipe(res);
        res.end;
        console.log('音声にアクセスがありました');
        break;
       default:
        res.writeHead(404, {'content-type':'txt/plain'});
        res.end();
    }
    function resError(code, err) { // エラー応答
        if (code instanceof Error) err = code, code = 500;
        res.writeHead(code, {'content-type': 'text/plain'});
        res.end(code + ' ' + http.STATUS_CODES[code] + '\n' +
            (err + '').replace(dir, '*'));
    }
}).listen(1337, '127.0.0.1');






function makeAudio(POST) {
    //const url = await get_TTS_URL(text, lang, speed);
    //console.log(`url=${url}`);
    //if (url == '') return;
str=POST['text'];
console.log('makeAudio:'+str);
voice = new VoiceText('<>')
voice
.speaker(voice.SPEAKER.HIKARI)
.emotion(voice.EMOTION.HAPPINESS)
.emotion_level(voice.EMOTION_LEVEL.HIGH)
.pitch(100)
.speed(100)
.volume(20)
.speak(str, function(e, buf){
    fs.writeFile('./test.wav',buf,'binary');
})
    //say(ip, buf);
}

function say(host, content) {
    const client = new Client();
    client.connect(host, function () {
        client.launch(DefaultMediaReceiver, function (err, player) {
            if (err) {
                console.log(err);
                return;
            }

            player.on('status', function (status) {
                console.log(`status broadcast playerState=${status.playerState}`);
            });

            const media = {
                contentId: content,
                contentType: 'audio/wav',
                streamType: 'BUFFERED'
            };
            player.load(media, { autoplay: true }, function (err, status) {
                console.log(`Error: ${err}`);
                client.close();
            });
        });
    });
    client.on('error', function (err) {
        console.log(`Error: ${err.message}`);
        client.close();
    });
};

//main();
