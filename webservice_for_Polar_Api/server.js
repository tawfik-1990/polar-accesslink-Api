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
 

 
var port = 3001;
 

 
app.use(require('./routes/router'));
 
http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});
