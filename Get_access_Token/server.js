const express = require('express');
const path = require('path');

const app = express();
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');

app.use(bodyParser.urlencoded({ extended: false }));




app.use(express.static(path.join(__dirname, 'public')));


var routes = require('./Routes/discovre');

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');



app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));





app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));




app.use(flash());




app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});





app.use('/', routes);



app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});
app.set('port', (process.env.PORT || 50451));

app.listen(app.get('port'), function(){
  console.info('Running on port   ', app.get('port'));
});


