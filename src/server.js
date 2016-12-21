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
    app.get('/resolveBitly', (req, res) => this.resolveBitly(req, res));
    app.get('/resolveGoogl', (req, res) => this.resolveGoogl(req, res));
    app.get('/resolveOwly', (req, res) => this.resolveOwly(req, res));
  }

  resolveGoogl(req, resp) {
    this.resolveShortenedUrl(req, resp, 'goo.gl/');
  }

  resolveBitly(req, resp) {
    this.resolveShortenedUrl(req, resp, 'bit.ly/');
  }

  resolveOwly(req, resp) {
    this.resolveShortenedUrl(req, resp, 'ow.ly/');
  }

  resolveShortenedUrl(req, resp, urlFormat) {
    let urlToResolve = (_.get(req, 'query.url') || '');

    if (!_.includes(urlToResolve, urlFormat)) {
      resp.json({
          status: '200',
          resolvedUrl: 'Not a valid ' + urlFormat + ' URL'
        });
    } else {
        const isUrlHTTPS = isHTTPS(urlToResolve);
        const urlGetter = isUrlHTTPS ? https : http;
        let prefix = '';
        if (isUrlHTTPS) {
          prefix = urlToResolve.indexOf('https://') < 0 ? 'https://' : '';
        } else {
          prefix = urlToResolve.indexOf('http://') < 0 ? 'http://' : '';
        }
        urlToResolve = prefix + urlToResolve;
        console.log('getting ', urlToResolve);
        urlGetter.get(urlToResolve, function(res) {
          const resolvedURL = (res.statusCode >= 300 && res.statusCode < 400) ? res.headers.location : urlToResolve;
          console.log('referring to: ', resolvedURL);
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
