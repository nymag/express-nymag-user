'use strict';

const _ = require('lodash'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  cookieName = 'user';

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
 * Should we block this request?
 * @param {*} req
 * @param {object} options
 * @param {function} [options.isProtected]
 * @returns {boolean}
 */
function shouldBlock(req, options) {
  const isProtected = _.get(options, 'isProtected'),
    hasDefinedProtectedLogic = _.isFunction(isProtected),
    hasCookiesEnabled = !!req.cookies;

  return hasCookiesEnabled && 
    hasDefinedProtectedLogic && 
    isProtected(req);
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

function redirect(req,res, options) {
  var authUrl = getAuthServerUrl(options, getOriginalUrl(req));
  if (authUrl) {
    res.redirect(authUrl);
  } else {
    res.status(403)
      .send('Forbidden: Protected resource with no authentication service defined.')
  }
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
        if (shouldBlock(req,options)) {
          redirect(req,res,options);
        } else {
          next();
        }
      } else {
        redirect(req,res,options);
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
