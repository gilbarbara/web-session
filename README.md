# web-session

[![NPM version](https://badge.fury.io/js/web-session.svg)](https://www.npmjs.com/package/web-session) [![build status](https://travis-ci.org/gilbarbara/web-session.svg)](https://travis-ci.org/gilbarbara/web-session) [![Maintainability](https://api.codeclimate.com/v1/badges/6e24b38c5c7a96de9db7/maintainability)](https://codeclimate.com/github/gilbarbara/web-session/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/6e24b38c5c7a96de9db7/test_coverage)](https://codeclimate.com/github/gilbarbara/web-session/test_coverage)

How many sessions does it takes for an user to create an account? Or purchase something?
Now you can track these metrics!

***What is a session anyway?***  
This is how a web session is defined by Google Analytics:

```
a period of time (30 minutes by default) that is extended automatically upon user interaction.
```

***How does it ends?***

- after 30 minutes of inactivity.
- at midnight (based on your GA settings, not client timezone).
- campaing query change (utm or gclid)


A simple demo for the [react](https://github.com/gilbarbara/react-web-session) implementation of this library that you use to inspect the session data:

[![Edit react-web-session demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n40w8w88jl)

## Usage

```bash
npm install --save web-session
```

And create a new session:

```js
import WebSession from 'web-session';

const webSession = new WebSession(options);

// After a location change or event dispatched to GA, call this function to update the session.
webSession.update();
```

You can pass an object to `update()` with custom data you might want in your session.

## Options

**callback** {function}: A function to receive the session data on every update.

**duration** {number}: The duration of the session in minutes. Defaults to `30`

**historySize** {number}: The max number of visits's history to keep. Defaults to `50`

**name** {string}: The name of the session in localStorage. Defaults to `WebSessionData`

**timezone** {number}: The timezone used in GA. Defaults to `UTC`

### Stored data
```js
{
  origin: {
    createdAt: '2000-01-01T00:15:00.000Z',
    href: '/',
    referrer: ''
  },
  current: {
    campaign: {},
    expiresAt: '2000-01-01T00:15:00.000Z',
    href: '/',
    referrer: ''
  },
  data: { // if using the optional data parameter with update
    something: true
  }
  history: [ // the different campaigns the user has entered in your site
    {
      createdAt: '2000-01-01T00:15:00.000Z',
      href: '/cpc?utm_source=cpc',
      referrer: ''
    },
    ...
  ],
  visits: 1
}
```

### References
[Counting web sessions with JavaScript](https://swizec.com/blog/counting-web-sessions-javascript/swizec/7598) by @Swizec  
[How a web session is defined in Analytics](https://support.google.com/analytics/answer/2731565?hl=en)
