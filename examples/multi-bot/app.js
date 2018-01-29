/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//import DiscoveryResult from './DiscoveryResult.js';
require('dotenv').load();



var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});

module.exports = function(app) {
  if (process.env.USE_SLACK) {
    var Slack = require('./bot-slack');
    Slack.controller.middleware.receive.use(middleware.receive);
    Slack.bot.startRTM();
    console.log('Slack bot is live');
  }
  if (process.env.USE_FACEBOOK) {
    var Facebook = require('./bot-facebook');
    Facebook.controller.middleware.receive.use(middleware.receive);
    Facebook.controller.createWebhookEndpoints(app, Facebook.bot);
    console.log('Facebook bot is live');
  }
  if (process.env.USE_TWILIO) {
    var Twilio = require('./bot-twilio');
    Twilio.controller.middleware.receive.use(middleware.receive);
    Twilio.controller.createWebhookEndpoints(app, Twilio.bot);
    console.log('Twilio bot is live');
  }
  // Customize your Watson Middleware object's before and after callbacks.
  middleware.before = function(message, conversationPayload, callback) {
    callback(null, conversationPayload);
  }

  middleware.after = function(message, conversationResponse, callback) {
    console.log("User input " + message.text);
    //console.log('%j',conversationResponse);
    
    if(conversationResponse.output.text == 'call_discovery') {
      console.log("We need to call Discovery service");
      var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');

      var discovery = new DiscoveryV1({
      username: process.env.DISCOVERY_USERNAME,  
      password: process.env.DISCOVERY_PASSWORD,
      version_date: '2017-11-07'
      });

      console.log("Going to Query WDS :: with input "+conversationResponse.input.text );

      discovery.query({ environment_id: process.env.ENVIRONMENT_ID, collection_id: process.env.COLLECTION_ID, query: conversationResponse.input.text },function(error, data) {
      if(error){
         console.log("errror");
      }
      //console.log(JSON.stringify(data, null, 2));

      //console.log("Answer is :: "+data.results[0].answer);
      var i = 0;
        var discoveryResults = [];
        while (data != null && i < 2 && data.results[i] != null) {
          let body = data.results[i].html;
        //  console.log(" ****** Body value is ::::: ")
         //console.log(JSON.stringify(data, null, 2));

         
        console.log(data.results[i].answer);
          discoveryResults[i] = {
            body: body,
            //bodySnippet: (body.length < 144 ? body : (body.substring(0,144) + '...')).replace(/<\/?[a-zA-Z]+>/g, ''),
            
           // text: data.results[i].text,
            confidence: data.results[i].score,
            id: data.results[i].id,
            sourceUrl: data.results[i].url,
            title: data.results[i].title,
            answer: data.results[i].answer
          };
          i++;
        }
        conversationResponse.output.discoveryResults = discoveryResults;

//console.log('%j',conversationResponse);

    //  this.addMessage( { label: 'Discovery Result:', message: 'Great question. Here\'s what I found:', date: (new Date()).toLocaleTimeString()});
     // this.formatDiscovery(conversationResponse.output.discoveryResults);
     // console.log('%j',discoveryResults);
     // var j= 0;     
     // while(j < 3){
     // console.log('%j', discoveryResults[j]);
     // console.log("Title : "+ discoveryResults[j].title);  
     // console.log("Text : "+ discoveryResults[j].text);
     // console.log("Source URL : "+ discoveryResults[j].sourceUrl);
     // j++;
     // }      
      
      callback(null, conversationResponse);
     });
    } else{
      callback(null, conversationResponse);
    } 
  }
   
}



