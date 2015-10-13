'use strict';

const _ = require('lodash'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  cookieName = 'user',
  defaultBlockDomains = ['nymetro.com'];

/**
 * Should we block this domain?
 * @param {*} req
 * @param {object} options
 * @returns {boolean}
 */
function shouldBlock(req, options) {
  const host = req.get('host') || '',
    isProtected = _.get(options, 'isProtected'),
    blockDomains = _.get(options, 'blockDomains', defaultBlockDomains),
    hasDefinedProtectedLogic = _.isFunction(isProtected),
    hostIsOnBlockList = _.any(blockDomains, function (value) { return host.indexOf(value) > -1; }),
    hasCookiesEnabled = !!req.cookies;

  return hasCookiesEnabled && hasDefinedProtectedLogic && hostIsOnBlockList && isProtected(req);
}

/**
 *
 * @param {object} options
 * @param {string} originalUrl
 * @returns {*}
 */
function getAuthServerUrl(options, originalUrl) {
  if (_.isFunction(options.redirectTo)) {
    return options.redirectTo(originalUrl);
  } else {
    return '/';
  }
}

/**
 * Get original url made from the parts from express
 * @param req
 * @returns {string}
 */
function getOriginalUrl(req) {
  const host = req.get('host'); // includes port on Chrome, needed for dev

  return req.protocol + '://' + host + req.originalUrl;
}

/**
 * Attempt to get user from cookie
 * @param {*} req
 * @returns {object}
 */
function getUser(req) {
  var user = null,
    cookies = req.cookies;

  if (_.isString(cookies.user)) {
    try {
      user = JSON.parse(cookies.user.replace(/\\"/g, '"').replace(/\\054/g, ','));
    } catch (ex) {
      console.error('Invalid JSON in "user" cookie' + ex);
    }
  }

  return user;
}

/**
 * @param {object} options
 * @returns {Function}
 */
function eachRequest(options) {
  return function (req, res, next) {
    if (shouldBlock(req, options)) {
      let user = getUser(req);

      if (user) {
        req.user = user;
        next();
      } else {
        res.redirect(getAuthServerUrl(options, getOriginalUrl(req)));
      }
    } else {
      next();
    }
  }
}

/**
 * @module
 */
module.exports = function (options) {
  const router = express.Router();

  router.use(cookieParser());
  router.use(eachRequest(options));

  return router;
};
