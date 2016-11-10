'use strict';

const http = require('http');
const https = require('https');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const DEFAULT_PORT = 5000;

class BitlyResolver {
  constructor() {
    this.startServer();
  }

  startServer() {
    const app = express();
    this.configAppServerMiddleware(app);
    this.configureServerRouting(app);

    app.listen(app.get('port'), () => {
      console.log('BitlyResolver Server is running on port', app.get('port'));
    });
  }

  configAppServerMiddleware(app) {
    app.use(cors());
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

    app.set('port', (process.env.PORT || DEFAULT_PORT));
  }

  configureServerRouting(app) {
    app.get('/resolveBitly', this.resolveBitly);
  }

  resolveBitly(req, res) {
    const urlToResolve = req.query.url;
    let resolvedURL = 'http://no-idea-yet/' + urlToResolve;

    res.json({
        status: '200',
        resolvedUrl: resolvedURL
      });
  }
}

new BitlyResolver();
