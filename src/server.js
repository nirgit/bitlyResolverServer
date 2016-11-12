'use strict';

const _ = require('lodash');
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

  resolveBitly(req, resp) {
    let urlToResolve = (_.get(req, 'query.url') || '');

    if (!_.includes(urlToResolve, 'bit.ly/')) {
      resp.json({
          status: '200',
          resolvedUrl: 'Not a valid bit.ly URL'
        });
    } else {
        const urlGetter = isHTTPS(urlToResolve) ? https : http;
        const prefix = urlToResolve.indexOf('http://') < 0 : 'http://' : '';
        urlToResolve = prefix + urlToResolve;
        console.log('getting ', urlToResolve);
        urlGetter.get(urlToResolve, function(res) {
          console.log('referring to: ', res.statusCode);
          const resolvedURL = (res.statusCode >= 300 && res.statusCode < 400) ? res.headers.location : urlToResolve;
          resp.json({
              status: '200',
              resolvedUrl: resolvedURL
            });
        });
    }
  }
}

function isHTTPS(url) {
  return (url || '').indexOf('https://') === 0;
}

new BitlyResolver();
