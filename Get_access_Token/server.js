const express = require('express');
const path = require('path');

const app = express();
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));


var routes = require('./Routes/discovre');

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');









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

app.listen(50451, () => {
  console.info('Running on port 50451');
});


