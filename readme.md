Express NYMag User
------------------

Volunteering user information for internal use.  This is not authentication; It just looks for a plain-text, unsigned
cookie that contains a username and LDAP groups.

NOTE: Use with care.  It's the same as user's volunteering their own username, and is not auth.  Temporary until OAuth.

## Usage

```js
app.use(require('@nymdev/express-nymag-user')({

  //what domains to enable blocking for
  blockDomains: ['qa.nymag.com', 'nymag.com', 'nymetro.com'],

  //logic for blocking
  isProtected: function (req) {
    return !!req.query.edit;
  }

}));
```

## Installation

```bash
npm install --save @nymdev/express-nymag-auth
```