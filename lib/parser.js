const Redis = require('./redis');
const utils = require('./utils');

lineParse = (events) => {
    return events.map(_lineParse);
}

facebookParse = (events) => {
    return events.map(_facebookParse);
}

_facebookParse = (obj) => {
    let msg = buildMsgObj();

    msg.uid = obj.sender.id;
    msg.replyToken = obj.sender.id;
    msg.timestamp = obj.timestamp;

    if ('text' in obj.message) {
        msg.type = 'text';
        msg.data.text = obj.message.text;
    } else if ('sticker_id' in obj.message) {
        msg.type = 'sticker';
        msg.data.stickerId = obj.message.sticker_id;
    } else {
        msg.type = 'other';
    }
    
    return new Promise( resolve => {
        Redis.getSession(msg.uid).then( value => {
            msg.sid = (value==undefined) ? utils.generateRandomString() : value;
            if (value == undefined) { Redis.setSession(msg.uid, msg.sid); }
            resolve(msg);
        });
    });
}

_lineParse = (obj) => {
    let msg = buildMsgObj();

    msg.uid = obj.source.userId;
    msg.replyToken = obj.replyToken;
    msg.timestamp = obj.timestamp;
    msg.type = obj.message.type;
   
    if (msg.type == 'text') {
        msg.data.text = obj.message.text;
    } else if (obj.message.type == 'sticker') {
        msg.data.stickerId = obj.message.stickerId;
    }

    return new Promise( (resolve, reject) => {
        Redis.getSession(msg.uid).then( value => {
            msg.sid = (value==undefined) ? utils.generateRandomString() : value;
            if (value == undefined) { Redis.setSession(msg.uid, msg.sid); }
            resolve(msg);
        });
    });
}

buildMsgObj = () => {
    return {
        appId: 'renda',
        uid: undefined,
        type: undefined,
        data: {},
        sid: undefined,
        timestamp: undefined,
        replyToken: undefined,
    }
}

const Parser = {
    lineParse,
    facebookParse,
};

module.exports = Parser;