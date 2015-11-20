Express NYMag User
------------------

Volunteering user information for internal use.  This is not authentication; It just looks for a plain-text, unsigned
cookie that contains a username and LDAP groups.

NOTE: Use with care.  It's the same as user's volunteering their own username, and is not auth.  Temporary until OAuth.

## Usage

```js
const express = require('express'),
  app = express(),
  expressNYMagAuth = require('@nymdev/express-nymag-user'),
  authServer = 'http://some_auth_server/login?redirect_to=';

app.use(expressNYMagAuth({
  blockDomains: ['your_domain.biz'],
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
