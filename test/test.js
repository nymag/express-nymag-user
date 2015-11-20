'use strict';

var _ = require('lodash'),
  expect = require('chai').expect,
  express = require('express'),
  lib = require('../'),
  sinon = require('sinon');

describe('tests', function () {
  var sandbox;

  function createRouter() {
    return {
      use: _.noop
    };
  }

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(express, 'Router', createRouter);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('does not throw', function () {
    expect(function () {
      lib();
    }).to.not.throw();
  });

  describe('shouldBlock', function () {
    var fn = lib[this.title];

    it('returns false on missing everything', function () {
      var req = {
          get: _.noop
        },
        options = {};

      expect(fn(req, options)).to.equal(false);
    });

    it('returns false when missing function', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          blockDomains: ['some host']
        };

      expect(fn(req, options)).to.equal(false);
    });

    it('returns false when not on block list', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          isProtected: function () {
            return true;
          },
          blockDomains: ['some not blocked host']
        };

      expect(fn(req, options)).to.equal(false);
    });

    it('throws with non-array block list', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          isProtected: function () {
            return true;
          },
          blockDomains: 'some non array'
        };

      expect(function () {
        fn(req, options);
      }).to.throw();
    });

    it('returns true when has everything', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          isProtected: function () {
            return true;
          },
          blockDomains: ['some host']
        };

      expect(fn(req, options)).to.equal(true);
    });

    it('returns true when has everything but domain from env', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          isProtected: function () {
            return true;
          }
        };

      process.env.BLOCK_DOMAINS = 'some host';

      expect(fn(req, options)).to.equal(true);
    });

    it('returns true when has everything but domain from env with many items', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          isProtected: function () {
            return true;
          }
        };

      process.env.BLOCK_DOMAINS = 'some other host, some host, some other host';

      expect(fn(req, options)).to.equal(true);
    });

    it('returns false when has everything but domain from env is not there', function () {
      var req = {
          get: _.constant('some host'),
          cookies: {}
        },
        options = {
          isProtected: function () {
            return true;
          }
        };

      process.env.BLOCK_DOMAINS = 'some other host, some _other_ host';

      expect(fn(req, options)).to.equal(false);
    });
  });
});

