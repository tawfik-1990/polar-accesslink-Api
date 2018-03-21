
var logger = require('morgan'),
  cors = require('cors'),
  http = require('http'),
  express = require('express'),
  errorhandler = require('errorhandler'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  helmet = require('helmet');
 
 
const app = express();
app.use(helmet())
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
 

 

 

 
app.use(require('./routes/router'));
 app.set('port', (process.env.PORT || 50451));

app.listen(app.get('port'), function(){
  console.info('Running on port   ', app.get('port'));
});