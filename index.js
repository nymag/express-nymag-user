'use strict';

const _ = require('lodash'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  cookieName = 'user',
  defaultBlockDomains = ['nymetro.com'];

/**
 * @param {string} target
 * @returns {function}
 */
function contains(target) {
  return function (value) {
    return target.indexOf(value) > -1;
  };
}

/**
 * @param {string} host
 * @param {object} options
 * @param {[string]} [options.blockDomains=defaultBlockDomains]
 * @returns {boolean}
 */
function isOnBlockList(host, options) {
  const blockDomains = _.get(options, 'blockDomains', defaultBlockDomains);

  if (!_.isArray(blockDomains)) {
    throw new Error('blockDomains must be Array');
  }

  return _.any(blockDomains, contains(host));
}

/**
 * Should we block this domain?
 * @param {*} req
 * @param {object} options
 * @param {function} [options.isProtected]
 * @param {[string]} [options.blockDomains=defaultBlockDomains]
 * @returns {boolean}
 */
function shouldBlock(req, options) {
  const host = req.get('host') || '',
    isProtected = _.get(options, 'isProtected'),
    hasDefinedProtectedLogic = _.isFunction(isProtected),
    hasCookiesEnabled = !!req.cookies;

  return hasCookiesEnabled && hasDefinedProtectedLogic && isOnBlockList(host, options) && isProtected(req);
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
 * @param {*} req
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

  if (_.isString(cookies[cookieName])) {
    try {
      user = JSON.parse(cookies[cookieName].replace(/\\"/g, '"').replace(/\\054/g, ','));
    } catch (ex) {} // deliberately do nothing
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
  };
}

/**
 * @param {object} options
 * @returns {express.Router}
 */
module.exports = function (options) {
  const router = express.Router();

  router.use(cookieParser());
  router.use(eachRequest(options));

  return router;
};

module.exports.eachRequest = eachRequest;
module.exports.shouldBlock = shouldBlock;
