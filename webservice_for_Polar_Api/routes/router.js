var express = require('express');
 var querystring = require('querystring');
var req = require('request');
 var mongo = require('mongodb').MongoClient;

var assert = require('assert');
 
const btoa = require('btoa');


const utf8 = require('utf8');





var url = 'mongodb://localhost:27017/';
var app = module.exports = express.Router();
 

app.post('/heart/:userid', function(req,res)

{
   var userid = req.params.userid;
  if (!userid || userid === "") {

    return res.status(400).send({ "success": false, "msg": "userid is false", "error": err })
  }
Get_Cle_Secret(userid)

.then( function( data1 ) { 

const  CLIENT_ID = data1[0].client_id;
const  CLIENT_SECRET = data1[0].client_secret;



 const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    return Get_Notifications (creds)

   
    } ).then( function( data) {  

return Get_accesstoken(data)
   
 } )
.then( function( data6) { 
const  userid = data6[0].user_idtoken;
const  Accesstoken = data6[0].access_token;

return Create_Transction (userid,Accesstoken)
   
 } ).then( function( data2) { 

const  userid = data2.userid;
const  Accesstoken = data2.access_token;
const  transaction = data2.transaction;

  return List_Exercises (userid.toString(),Accesstoken.toString(),transaction.toString())
   
 } ).then( function( data3) { 
 	


const  Accesstoken = data3.access_token;
const  dat = data3.data;

 return Get_samples(Accesstoken.toString(),dat)
    
  } ).then( function( data4) { 

const  Accesstoken = data4.access_token;
const  dat = data4.data;

 return Get_heart_rate (Accesstoken.toString(),dat)

    } ).then( function( data5 ) { 

return res.status(201).send({ "success": true, "msg": data5 })
  } )
    .catch((error) => {
  
});



})



function Get_Notifications (client_credentials,data)
{
  return new Promise( function( resolve, reject ){
req({
    headers: {
      
  'Accept':'application/json',
  'Authorization': `Basic ${client_credentials}`
    },

  uri:  'https://www.polaraccesslink.com/v3/notifications',
   
    method: 'GET'
  },function  (err, res, body) {
    if (err )
    {
    
      reject(err);
    }
    else if(body==='')
    {

reject("kein notifications");
       
    

        
    }
    else
    {
    var json= JSON.parse(body);
    console.log(json);
    var user = json ["available-user-data"][0]["user-id"];
  
   
 resolve(user);

   }

  } );
} );


}
function Create_Transction  (user,Accesstoken)
{
  return new Promise( function( resolve, reject ){
req({
    headers: {
      
  'Accept':'application/json',
'Authorization': `Bearer ${Accesstoken}`
    },

  uri:  'https://www.polaraccesslink.com/v3/users/'+user+'/exercise-transactions',
   
    method: 'POST'
  }, function  (err, res, body) {
    
    if (err ) {
 reject(err );
    }
     else if(body==='')
    {

reject("kein transaction");
       


        
    }
  else
  {
var json= JSON.parse(body);
    var transaction = json [ "transaction-id"];
    
     

var dat ={

  access_token:Accesstoken,
  userid:user,
  transaction:transaction
}
resolve(dat);

  }
  
 } ) ;
 } ) ;

  }



function List_Exercises (userid,Accesstoken,transaction_id)
{

return new Promise( function( resolve, reject ){
req({
    headers: {
      
  'Accept':'application/json',
'Authorization': `Bearer ${Accesstoken}`
    },

  uri: 'https://www.polaraccesslink.com/v3/users/'+userid+'/exercise-transactions/'+transaction_id+' ',
   
    method: 'GET'
  }, function  (err, res, body) {
       if (err  ) {

        reject(err);
       

    } else if(res.statusCode === 404)
    {
     
     reject("Not found");
    }
    else if(res.statusCode === 204)
    {

     reject("no content");
   
    }
    else
    {
    console.log(body);   
var json = JSON.parse(body);



var js = json.exercises;
var dat ={

  access_token:Accesstoken,
  
  data:js
};
resolve(dat);
    }
  
  
 } ) ;
 } ) ;

}


function Get_samples(Accesstoken,urls)
{

return new Promise( function( resolve, reject ){
var responses = [];
var responsess = [];
var responses1 = [];
var completed_requests = 0;

for (i in urls)
{

 
req({
    headers: {
      
  'Accept':'application/json',
'Authorization': `Bearer ${Accesstoken}`
    },

  uri:  ` ${urls[i]}/samples`,
   
    method: 'GET'
  }, function  (err, res, body) {


       if (err  ) {

        reject(err);
       completed_requests++;
   
    } 

    else if(body ==='' )
    {

     reject("no content");
   completed_requests++;
    }
    else
    {
       responses.push(body);
       completed_requests++;
       
       if (completed_requests == urls.length) 
 {
          
           for(var i=0; j=urls.length,i<j; i++) 
           {

           responsess.push(JSON.parse (responses[i]));
         
           }

           for(var i=0; j=responsess.length,i<j; i++) 
           {
         

           responses1.push(responsess[i].samples[0]);
          
          

           }
           var dat =
           {
           access_token:Accesstoken,
           
              data:responses1
           }
           
           resolve(dat);

          }
    }


 } ) ;

}
 } ) ;
}


function Get_heart_rate (Accesstoken,urls)
{
return new Promise( function( resolve, reject ){
  
var responses = [];
var completed_requests = 0;
for (i in urls)
{
req({
    headers: {
      
  'Accept':'application/json',
'Authorization': `Bearer ${Accesstoken}`
    },

   uri:  ` ${urls[i]}`,
   
    method: 'GET'
  }, function  (err, res, body) {
        if (err  ) {

        reject(err);
       completed_requests++;
   
    } 

    else if(body ==='' )
    {

     reject("no content");
   completed_requests++;
    }
    else
    {
       responses.push(body);
       completed_requests++;
       

    }
        if (completed_requests == urls.length) 
 {
          
            

           resolve(responses);

}

  
  
 } ) ;
}
 } ) ;
}


function Get_Cle_Secret (userid)
{

 return new Promise( function( resolve, reject ){

mongo.connect(url, function(err, db) {
    if (err)
    {
    	reject(err);
    }
    else
    {
     var dbo = db.db("usertoken");
     var query = { userid: userid };
    dbo.collection("user").find(query).toArray(function(err, result) {
      if(err)
      {
        reject(err);
      }
      else if (!result.length) {                                                   
     reject(result);


  } else{

 
 resolve(result);
  
 
}
    
    });
    }
  });
  });

}


function Get_accesstoken(userid)
{

 return new Promise( function( resolve, reject ){
 
mongo.connect(url, function(err, db) {
    if (err)
    {
      reject(err);
    }
    else
    {
     var dbo = db.db("usertoken");
     var query = { user_idtoken:userid };
    dbo.collection("user").find(query).toArray(function(err, result) {
      if(err)
      {
        reject(err);
      }
      else if (!result.length) { 
      console.log(result);                                                  
     reject(result);


  } else{


 resolve(result);
  
 
}
    
    });
    }
  });
  });

}
