'use strict';

const _ = require('lodash');
const http = require('http');
const https = require('https');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const uu = require('url-unshort')();

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
    app.get('/resolve', (req, res) => this.resolveShortenedUrl(req, res));
    app.get('/resolveBitly', (req, res) => this.resolveShortenedUrl(req, res));
    app.get('/resolveGoogl', (req, res) => this.resolveShortenedUrl(req, res));
    app.get('/resolveOwly', (req, res) => this.resolveShortenedUrl(req, res));
  }

  resolveShortenedUrl(req, resp) {
    let urlToResolve = (_.get(req, 'query.url') || '');

    const isUrlHTTPS = isHTTPS(urlToResolve);
    let prefix = '';
    if (isUrlHTTPS) {
      prefix = urlToResolve.indexOf('https://') < 0 ? 'https://' : '';
    } else {
      prefix = urlToResolve.indexOf('http://') < 0 ? 'http://' : '';
    }
    urlToResolve = prefix + urlToResolve;
    console.log('getting ', urlToResolve);
    uu.expand(urlToResolve).then(resolvedURL => {
      resp.json({
        status: '200',
        resolvedUrl: resolvedURL || 'Couldn\'t resolve that URL'
      });
    }).catch(err => resp.json({
      status: '200',
      resolvedUrl: 'Failed resolving ' + urlToResolve + ' URL'
    }));
  }
}

function isHTTPS(url) {
  return (url || '').indexOf('https://') === 0;
}

new BitlyResolver();
