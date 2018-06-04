const WebSocket = require('ws');
const OKTA_SMS_CODE_REGEX = /[0-9]+/;

function getOktaCodeFromPhone(pbAccessToken) {
  return new Promise((resolve, reject)=> {
    const pbSocket = new WebSocket(`wss://stream.pushbullet.com/websocket/${pbAccessToken}`);
    pbSocket.on('message', (event)=> {
      if (isSMS(event)) {
        const sms = eventData.push.notifications[0];
        const code = extractCodeFromSMS(sms);
        resolve(code);
      }
    });
    pbSocket.on('error', reject);
  });
}

function isSMS(eventData) {
  return eventData.type === "push" && eventData.push.type === "sms_changed";
}

function extractCodeFromSMS(sms) {
  return sms.body.match(OKTA_SMS_CODE_REGEX)[0];
}

module.exports = getOktaCodeFromPhone;
