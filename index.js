const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid')
const chalk = require('chalk');
const models = require('./models');

const fs = require('fs');
require('dotenv').config({
  path: '.variables.env'
});

morgan.token('id', function getId(req) {
    return req.id;
  })

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(assignId);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use(morgan(':id :method :url :response-time', {
  stream: fs.createWriteStream('./access.log',{flags: 'a'})
}));

function assignId (req, res, next) {
  req.id = uuid.v4()
  next()
}

app.use('/api/v1/dataStorage', require('./routes/organization'))
models.sequelize.sync().then(() => {
    app.listen(9000, () => {
      console.log(chalk.green(`Express server listening on port ${process.env.PORT}`));
    });
  })
 