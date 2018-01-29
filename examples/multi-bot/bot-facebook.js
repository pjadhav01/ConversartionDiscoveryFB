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

var Botkit = require('botkit');

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();
controller.hears('(.*)', 'message_received', function(bot, message) {
  var outputString = message.watsonData.output.text.join("\n");
  if( message.watsonData.output.discoveryResults!= null ){
    outputString = "SmartBot found following answers \n" ;
    var k=0 ;
    while( k< 1){
      if(typeof message.watsonData.output.discoveryResults != null)
      {
        console.log(JSON.stringify(message.watsonData.output.discoveryResults, null, 2));
        outputString = outputString + "[" + (k+1) + "]" +  message.watsonData.output.discoveryResults[k].answer + "\n";
        outputString +=   message.watsonData.output.discoveryResults[k].sourceUrl + "\n";
      }
      k++;
    } 
   }
  
 // bot.reply(message, message.watsonData.output.text.join("\n") + outputString);
 
 bot.reply(message,  outputString);
 //console.log("Facebook bot received message : ");
 //console.log(JSON.stringify(message, null, 2));
});

module.exports.controller = controller;
module.exports.bot = bot;
