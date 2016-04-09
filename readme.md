Express NYMag User
------------------

Volunteering user information for internal use.  This is not authentication; It just looks for a plain-text, unsigned
cookie that contains a username and LDAP groups.

All authorization logic is encapsulated in the implementation of isProtected.  

NOTE: Use with care.  It's the same as user's volunteering their own username, and is not auth.  Temporary until OAuth.

## Setup

If redirect_to does not retun valid url (e.g. if host is not defined) and the request should be blocked, the middleware protects via 403.

## Usage

```js
const express = require('express'),
  app = express(),
  expressNYMagUser = require('@nymdev/express-nymag-user'),
  authServer = 'http://some_auth_server/login?redirect_to=';

app.use(expressNYMagUser({
  redirectTo: function (originalUrl) {
    return authServer + encodeURIComponent(originalUrl);
  },
  isProtected: function (req) {
    return !!req.query.edit;
  }
}));
```

## Installation

```bash
npm install --save @nymdev/express-nymag-auth
```
