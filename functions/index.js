// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({
  debug: true
});
const https = require('https');
const host = 'api.meetup.com';
const httpGET = 'GET';
const jsonContentType = 'application/json';

// Handle the Dialogflow intent named 'activity'.
// The intent collects a parameter named 'Activity'.
app.intent('activity', (conv, {
  Activity
}) => {

  const luckyNumber = Activity.length;
  // Respond with the user's lucky number and end the conversation.
  //conv.close('Your lucky number is ' + luckyNumber + ' yeehaw!');
  handleEventSearch(conv, "hiking");
});

function handleEventSearch(conv, req) {
	  callSearchEvents(req).then((output) => {

    return conv.close('Your lucky number is ' + luckyNumber + ' yeehaw!');

  }).catch((reason) => {
    return conv.close('Your lucky number is 7 yeehaw!');
  });
}

function callSearchEvents(events) {
  return new Promise((resolve, reject) => {
    let path = '/2/events?key=62663d4f7b391b7143156918537f7722&group_urlname=ny-tech&sign=true';

    const options = {
      hostname: host,
      path: path,
      method: httpGET,
      headers: {
        'Content-Type': jsonContentType
      }
    };

    const req = https.request(options, res => {
      res.setEncoding('utf8');
      var data = ''

      res.on('data', chunk =>  {
        data += chunk
      });

      res.on('end', () => {
        let responseJson = JSON.parse(data);
        resolve(responseJson);
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(new Error(`problem with request: ${e.message}`));
    });

    req.end();
  });
}

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
