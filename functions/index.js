// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const {
  dialogflow,
  SimpleResponse,
  BasicCard,
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
  return handleEventSearch(Activity).then((output) => {
    return conv.close(new SimpleResponse({
      speech: output,
      text: output + " http://www.whereisdarran.com",
    }))
  }).catch((reason) => {
    return conv.close(new SimpleResponse({
      speech: reason.message,
      text: reason.message,
    }));
  });
});

function handleEventSearch(events) {
  return new Promise((resolve, reject) => {
    callSearchEvents(events).then((output) => {
      return resolve('There are ' + output.events.length + ' ' + events + ' events in Austin.');
    }).catch((reason) => {
      reject(new Error(reason));
    });
  })
}

function callSearchEvents(searchTerm) {
  return new Promise((resolve, reject) => {
    let path = '/find/upcoming_events?key=62663d4f7b391b7143156918537f7722' +
      '&photo-host=public&page=100&text=' + searchTerm + '&sig_id=205377881&lon=-97.7431&lat=30.2672';

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

      res.on('data', chunk => {
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
