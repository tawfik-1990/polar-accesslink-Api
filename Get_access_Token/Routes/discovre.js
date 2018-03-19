 const express = require('express');

var querystring = require('querystring');
var req = require('request');
var UUID = require('uuid-js');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var assert = require('assert');
// var mongo = require('mongodb').MongoClient;
const URLSearchParams = require ('url') ;
const btoa = require('btoa');

const { catchAsync } = require('./utils');
const router = express.Router();
const utf8 = require('utf8');
 const path = require('path');


 
const redirect = process.env.REDIRECT;



 router.get('/', function (req, res)  {


   res.render('login');

});


router.post('/login', (req, res) => {
  

  const CLIENT_ID = req.body.clientid;
const CLIENT_SECRET = req.body.ClientSecret;
const email = req.body.email;
const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

   res.redirect(`https://flow.polar.com/oauth2/authorization?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirect}`);
   router.get('/callback', function (req, res)  {


  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  


 access(code,redirect,creds, function(err, body) {
  if (err) {
   res.json(err);
  } else {
  

     
var Accesstoken= body.access_token;
var userid=body.x_user_id;
var uuid4 = UUID.create(4);
var memberid = uuid4.toString();


regeister(Accesstoken,memberid,function(err,body){


if (err) {
   res.json(err);
  } else {

    
 insert_access_token_to_database(email, Accesstoken, userid,CLIENT_ID ,CLIENT_SECRET);
res.redirect('/erfoglisch');
  }



})

 }
});


});



});


router.get('/erfoglisch', function (req, res)  {
   res.render('login');

});



function access  (code,redeirect,creds,callback)
 {
  

   const  dat = {
              'grant_type': 'authorization_code',

              'code': `${code}`,
               'redirect_uri': `${redirect}`,
               };
     


      var date = querystring.stringify(dat);
var contentLength = dat.length;

req({
    headers: {
      'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
     'Accept':'application/json; charset=utf-8',

     'Authorization':`Basic ${creds}`
    },

  uri: 'https://polarremote.com/v2/oauth2/token',
    body: date,
    method: 'POST'
  }, function  (err, res, body) {
    if (err || res.statusCode !== 200)
     {
      return callback(err );
      
    } 

else
{

  callback(null, JSON.parse(body)); 

}

  } );


 }



function regeister(accestoken,memberid,callback){
var xml= '<?xml version="1.0" encoding="utf-8" ?><register><member-id>'+memberid+'</member-id> </register>';
console.log(xml);
req({
    headers: {
      'Content-Type':'application/xml',
       'Accept':'application/json',
       'Authorization': `Bearer ${accestoken}`
              },

  uri: 'https://www.polaraccesslink.com/v3/users',
    body: xml,
    method: 'POST'
  }, function  (err, res, body) {
    if (err ) 
    {
      callback(err);
    }
    else
    {

     callback(body);
  
   }
  } );
}




function get (userid,accestoken)
{
req({
    headers: {
      
  'Accept':'application/json',
  'Authorization': `Bearer ${accestoken}`
    },

  uri: 'https://www.polaraccesslink.com/v3/users/'+userid+'',
   
    method: 'GET'
  }, function  (err, res, body) {
    if (err )
     {
      console.log(err);
      }
  console.log(body);
  
 
  } );


}











function insert_access_token_to_database(userid, accestoken,user_idtoken,clientid, ClientSecret)
{

  var item = {
    userid: userid,
   access_token: accestoken,
   user_idtoken:user_idtoken,
   client_id : clientid,
client_secret :ClientSecret
  };
var db;


mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }


  db = client.db();
  
  var query = { userid: userid };
    db.collection("user").find(query).toArray(function(err, result) {
      if(err)
      {
        console.log(err);
      }
      else if (!result.length)
       {                                                   
    
    
    
db = client.db();
db.collection("user").insertOne(item, function(err, result) {

  assert.equal(null, err);
     
     
      

      })

      }
      else
      {
        console.log('Works');

 
     db = client.db();
     var query = { userid: userid };
    var newvalues = { $set: {access_token:accestoken ,user_idtoken:user_idtoken,  client_id : clientid,
        client_secret :ClientSecret } };
     db.collection("user").updateOne(query, newvalues, function(err, res){
      assert.equal(null, err);
     
     
  


       })

  
      } 


});
});
}


module.exports = router;
