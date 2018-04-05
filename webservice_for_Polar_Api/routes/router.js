var express = require('express');
var querystring = require('querystring');
var req = require('request');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var assert = require('assert');
const btoa = require('btoa');
const utf8 = require('utf8');



var app = module.exports = express.Router();
 

app.get('/heart/:userid', function(req,res)

{

     var userid = req.params.userid;

     Get_Cle_Secret(userid)

    .then( function( data1 ) { 

            const  CLIENT_ID = data1[0].client_id;
            const  CLIENT_SECRET = data1[0].client_secret;
            const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

      return Get_Notifications (creds)

         
      } )
    .then( function( data) {  

       return Get_accesstoken(data)
         
      } ).then( function( data6) { 

            const  userid = data6[0].user_idtoken;
            const  Accesstoken = data6[0].access_token;

      return Create_Transction (userid,Accesstoken)
         
       } ).then( function( data2) { 

          const  userid = data2.userid;
          const  Accesstoken = data2.access_token;
          const  transaction = data2.transaction;

      return List_Exercises (userid,Accesstoken,transaction)
         
       } ).then( function( data3) { 
       
          const  user_id = data3.userid;
          const  transaction_id = data3.transactionid;
          const  Accesstoken = data3.access_token;
          const  dat = data3.data;

      return  Get_exercise_summary(Accesstoken,dat,user_id,transaction_id)

      } ).then( function( data4) { 
       
          const  user_id = data4.userid;
          const  transaction_id = data4.transactionid;
          const  Accesstoken = data4.access_token;
          const  dat = data4.data;
       
       return  Get_samples(Accesstoken,dat,transaction_id,user_id)

      } ).then( function( data5) { 
       
          const user_id = data5.userid;
          const  transaction_id = data5.transactionid;
          const  Accesstoken = data5.access_token;
          const  samples = data5.data;
       
      return  Get_heart_rate (Accesstoken,samples,user_id,transaction_id )

      } ).then( function( data7 ) { 

          const userid = data7.userid;
          const  Accesstoken = data7.access_token;
          const  transactionid = data7.transactionid;
          const  dat = data7.data;

      return Commit_Transction  (Accesstoken,userid,transactionid,dat)

      } ).then( function( data8 ) { 

      return insert_heartrate_to_Database(data8)

        } ).then( function( data9 ) { 

      return res.status(200).send({ "success": true, "Data":data9 ,"statusCode":200})


        } ).catch((error) => {
         return res.status(201).send({ "success": false, "statusCode":201})
      });


});
app.get('/user/:email',function(req,res)
{

        var email = req.params.email;

         Check_User (email,function(response) {

                 if(response == true)
                {
                   return res.status(200).send({ "success": true, "statusCode":200})

                }
                else
                {
                   return res.status(201).send({ "success": false, "statusCode":201})

                }

        });

});

function Get_Notifications (client_credentials,data)
{
return new Promise( function( resolve, reject ){

        req({
             headers: 
             {
              
             'Accept':'application/json',
             'Authorization': `Basic ${client_credentials}`
              },

              uri:  'https://www.polaraccesslink.com/v3/notifications',
           
            method: 'GET'
          },function  (err, res, body) 
          {
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
                  
                          if (err )
                          {
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
                     if (err  ) 
                     {
                      reject(err);
                     } 
                     else if(res.statusCode === 404)
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
                                   userid :userid,
                                   access_token:Accesstoken,
                                   transactionid: transaction_id,
                                   data:js
                                   };

                  resolve(dat);

                  }
          
         } ) ;
 } ) ;

}


function Get_samples(Accesstoken,info,transactionid,userid)
{
return new Promise( function( resolve, reject ){

        var responses = [];
        var completed_requests = 0;

        for (i in info)
        {
                  req({
                      headers: {
                        
                     'Accept':'application/json',
                     'Authorization': `Bearer ${Accesstoken}`
                      },

                      uri:  'https://www.polaraccesslink.com/v3/users/'+userid+'/exercise-transactions/'+transactionid+'/exercises/'+ info[i][2]+'/samples',
                     
                      method: 'GET'
                    }, function  (err, res, body) {

                                   if (err  ) 
                                   {

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
                                           responses.push(JSON.parse(body));
                                           completed_requests++;

                                           
                                           if (completed_requests == info.length) 
                                             {

                                                var samples=[];

                                             for(k in responses)
                                               {
                                                     res=[];
                                                     res.push(responses[k].samples[0]);
                                                     res.push(info[k][1]);
                                                     samples.push(res);
                                             
                                                }
                          
                                               var dat = {
                                                            userid :userid,
                                                            transactionid: transactionid,
                                                            access_token:Accesstoken,
                                                            data:samples
                                                          }
                                              
                                              resolve(dat);

                                              }
                                }


                   } ) ;

        }
 } ) ;

}

function Get_heart_rate (Accesstoken,samples,user_id,transaction_id )
{
return new Promise( function( resolve, reject ){
  
                  var responses = [];
                  var completed_requests = 0;
                  for (i in samples)
                  {
                          req({
                              headers: {
                                
                            'Accept':'application/json',
                            'Authorization': `Bearer ${Accesstoken}`
                              },

                             uri:  ` ${samples[i][0]}`,
                             
                              method: 'GET'
                            }, function  (err, res, body) {

                                      if (err  )
                                      {
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
                                         responses.push(JSON.parse(body));
                                         completed_requests++;
                                         
                                      }
                                         if (completed_requests == samples.length) 
                                           {
                                            
                                                    var heart_rate =[];

                                                   for(i in responses)
                                                   {
                                                         var res=[];
                                                         res.push(responses[i].data);                                               
                                                         res.push(samples[i][1]);
                                                         res.push(user_id);
                                                         heart_rate.push(res);

                                                    }

                                                  var dat = {
                                                               userid :user_id,
                                                               transactionid: transaction_id,
                                                               access_token:Accesstoken,
                                                               data:heart_rate
                                                             }
                                                   
                                                resolve(dat); 
                                                    
                                         }

                            
                            
                           } ) ;
                  }
 } ) ;
}



function Get_exercise_summary (Accesstoken,urls,user_id,transaction_id )
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

                              if (err  )
                              {
                                 reject(err);
                                 completed_requests++;                             
                              } 

                              else if(res.statusCode === 204)
                              {
                                reject("no content");
                                completed_requests++;
                              }
                              else
                              {                            
                                responses.push(JSON.parse(body));
                                completed_requests++;
                                 
                              }
                                  if (completed_requests == urls.length) 
                                   {

                                            var exercise_summary=[];

                                            for(i in responses)
                                            {
                                                 var temp=[];
                                                 temp.push(responses[i]["transaction-id"]);                                       
                                                 temp.push(responses[i]["start-time"]);
                                                 temp.push(responses[i].id);
                                                 exercise_summary.push(temp);

                                             }

                                             var dat = {
                                                          userid :user_id,
                                                          transactionid: transaction_id,
                                                          access_token:Accesstoken,           
                                                          data:exercise_summary
                                                        }                                           
                                            resolve(dat); 
                                    
                                    }

                           } ) ;
                  }
 } ) ;
}


function Get_Cle_Secret (userid)
{

var db ;
 return new Promise( function( resolve, reject ){

     mongodb.connect(process.env.MONGODB_URI, function(err, client) 
     {
                if (err)
                {
                  reject(err);
                }
                else
                {
                         db = client.db();
                        var query = { userid: userid };
                        db.collection("user").find(query).toArray(function(err, result) {
                                if(err)
                                {
                                  reject(err);
                                }
                                else if (!result.length) {                                                   
                                  reject(result);
                                } 
                               else
                               {
                                  resolve(result);
                               }
                        
                        });
                }
       });
  });

}


function Get_accesstoken(userid)
{

var db ;
 return new Promise( function( resolve, reject ){
 
      mongodb.connect(process.env.MONGODB_URI, function(err, client) 
      {
                    if (err)
                    {
                      reject(err);
                    }
                    else
                    {
                     db = client.db();
                     var query = { user_idtoken:userid };
                     db.collection("user").find(query).toArray(function(err, result) {

                              if(err)
                              {
                               reject(err);
                              }
                              else if (!result.length) { 
                              reject(result);
                             } 
                             else
                             {
                              resolve(result);
                             }
                    
                    });
                    }
      });
  });

}

function Commit_Transction(Accesstoken,userid,transactionid,data)
{
  return new Promise( function( resolve, reject ){
          req({
              headers: {

                'Authorization': `Bearer ${Accesstoken}`
               },
              uri:   'https://www.polaraccesslink.com/v3/users/'+userid+'/exercise-transactions/'+transactionid+' ',
              method: 'PUT'
              }, function  (err, res, body) {
              
                            if (err ) 
                            {
                              reject(err );
                            }
                            else if(res.statusCode == 200)
                            {
                              resolve(data);    
                            }
                            else if(res.statusCode == 204)
                            {                          
                              reject("204");
                            }
                            else
                            {
                               reject("404");
                            }
            
           } ) ;
 } ) ; 
}





function insert_heartrate_to_Database(data)
{

var db ;
 return new Promise( function( resolve, reject ){
 
      mongodb.connect(process.env.MONGODB_URI, function(err, client) 
        {
                    if (err)
                    {
                      reject(err);
                    }
                    else
                    {
                     db = client.db();
                     var query = { user_idtoken:data[0][2] };
                     db.collection("user").find(query).toArray(function(err, result) {

                                    if(err)
                                    {
                                       reject(err);
                                    }
                                    else if (!result.length)
                                    {                                                                                     
                                      reject(result);
                                    } 
                                   else
                                   {
                                    
                                    var useremail=result[0].userid;
                                    console.log(useremail);
                                    for(var i=0; j=data.length,i<j; i++)
                                    {                                  
                                            var item = {
                                                            user: useremail,
                                                            heart_rate: data[i][0],
                                                            start_time:data[i][1],
                                                            userid_polar: data[i][2]
                                                          };
                                             db = client.db();
                                             db.collection("user").insertOne(item, function(err, result) {

                                                 assert.equal(null, err);
                                             
                                              })
                                     }
                                    resolve(data);
                                   }
                    
                    });
                    }
          });
  });

}


function Check_User (Email,callback)
{

   var db ;


     mongodb.connect(process.env.MONGODB_URI, function(err, client) 
      {
              if (err)
              {
                callback(false);
              }
              else
              {
              db = client.db();
              var query = { userid: Email };
              db.collection("user").find(query).toArray(function(err, result)
               {
                          if(err)
                          {
                            callback(false);
                          }
                          else if (!result.length) {                                                   
                           callback(false);
                          } 
                         else
                         {
                          callback(true);
                         }
              
              });
              }
      });
           

}

