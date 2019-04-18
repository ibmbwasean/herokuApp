// var AssistantV2 = require('watson-developer-cloud/assistant/v2');
const AssistantV2 = require('watson-developer-cloud/assistant/v2');

let assistantID = '8eef7b18-6d53-4575-9919-6751b96d4839'

const initAssistant = (callback) => {
  let assistant = new AssistantV2({
    version: '2019-02-28',
    iam_apikey: 'bWr1iapTA0jvrAM3zttlA3OsKclFATRgJRWQ7pOyvoDy',
    url: 'https://gateway.watsonplatform.net/assistant/api'
  });


  let session_id = ''
  assistant.createSession({
    assistant_id: assistantID,
  }, function (err, response) {
    if (err) {
      console.error(err);
      // callback(err, null)
    } else {
      console.log(JSON.stringify(response, null, 2));
      // callback(null, response)
      session_id = response.session_id
      assistant.message({
        assistant_id: assistantID,
        session_id: session_id,
        input: {
          'message_type': 'text',
          'text': 'Hello'
        }
      }, function (err, response) {
        var data = ''
        var resobj = {}
        if (err) {
          console.log('error:', err);
          callback(err, null)
        }
        else {
          // console.log(JSON.stringify(response, null, 2));
          data = JSON.stringify(response.output.generic[0].text, null, 2)
          data = data.replace(/^"(.*)"$/, '$1');
          // console.log("========= ALMOST THERE DONT GIVE UP =========");
          // console.log(data);
          // console.log(session_id);
          resobj['text'] = data;
          resobj['session_id'] = session_id;

          callback(null, resobj)
        }
      });
    }
  })
}


const send = (sessionID, message, callback) => {
  let assistant = new AssistantV2({
    version: '2019-02-28',
    iam_apikey: 'bWr1iapTA0jvrAM3zttlA3OsKclFATRgJRWQ7pOyvoDy',
    url: 'https://gateway.watsonplatform.net/assistant/api'
  });

  assistant.message({
    assistant_id: assistantID,
    session_id: sessionID,
    input: {
      'message_type': 'text',
      'text': message
    },
  }, function (err, response) {
    var data = ''
    var intent = ''
    var entity = {}
    var resobj = {}
    if (err) {
      console.log('error:', err);
      callback(err, null)
    }
    else {
      console.log(JSON.stringify(response, null, 2));
      console.log(response.output.generic);
      if (response.output.generic.length > 0) {
        // console.log("========= ALMOST THERE DONT GIVE UP =========");
        data = JSON.stringify(response.output.generic[0].text, null, 2)
        data = data.replace(/^"(.*)"$/, '$1');
        // console.log(data);
        resobj['text'] = data;
      }
      if (response.output.intents.length > 0) {
        intent = JSON.stringify(response.output.intents[0].intent, null, 2)
        intent = intent.replace(/^"(.*)"$/, '$1');
        resobj['intent'] = intent;
      }

      callback(null, resobj)
    }
  });
}

module.exports = {
	initAssistant,
	send
}