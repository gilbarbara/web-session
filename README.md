# web-session

[![NPM version](https://badge.fury.io/js/web-session.svg)](https://www.npmjs.com/package/web-session) [![build status](https://travis-ci.org/gilbarbara/web-session.svg)](https://travis-ci.org/gilbarbara/web-session) [![Maintainability](https://api.codeclimate.com/v1/badges/6e24b38c5c7a96de9db7/maintainability)](https://codeclimate.com/github/gilbarbara/web-session/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/6e24b38c5c7a96de9db7/test_coverage)](https://codeclimate.com/github/gilbarbara/web-session/test_coverage)

How many sessions does it take for a user to create an account or purchase something?
Now you can track these metrics!

***What is a session anyway?***  
This is how a web session is defined by Google Analytics:

```
a period of time (30 minutes by default) that is extended automatically upon user interaction.
```

***How does it end?***

- after 30 minutes of inactivity.
- at midnight (based on your GA settings, not client timezone).
- campaign query change (utm or gclid)


A simple demo for the [react](https://github.com/gilbarbara/react-web-session) implementation of this library that you can use to inspect the session data:

[![Edit react-web-session demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n40w8w88jl)

## Usage

```bash
npm install --save web-session
```

And create a new session:

```typescript
import WebSession from 'web-session';

const webSession = new WebSession();

// Initialize your session
webSession.init();

// After a location change or analytics event dispatched, call this function to update the session.
webSession.update();
```

## API

<details>
  <summary>Type Definition</summary>

  ```typescript
type AnyObject<T = any> = Record<string, T>;
type NarrowPlainObject<T> = Exclude<T, any[] | ((...items: any[]) => any)>;

interface Options {
  /*
   * A function called on every update that receive the session data.
   * @default noop
   */
  callback: (session: Session) => void;
  /*
   * The session duration in minutes
   * @default 30
   */
  duration: number;
  /*
   * The max history size
   * @default 50
   */
  historySize: number;
  /*
   * The session name
   * @default 'WebSessionData'
   */
  name: string;
  /*
   * The session timezone used in GA
   * @default 'UTC'
   */
  timezone: string;
}

interface Origin {
  createdAt: string;
  href: string;
  referrer: string;
}

interface Session {
  current: CurrentSession;
  data?: AnyObject;
  history: Origin[];
  origin: Origin;
  visits: number;
}
  ```
</details>

**constructor(options?: Partial\<Options>)**  
Create a new instance.

**init(options?: Partial\<Options>)**  
Initialize the session. You can change the session options here.

**update<T = AnyObject>(data?: T & NarrowPlainObject<T>, replaceData = false)**  
Update/Replace the session data.

**session**  
Get the current session.

### Session data

```typescript
({
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
  },
  history: [ // the different campaigns the user has entered in your site
    {
      createdAt: '2000-01-01T00:15:00.000Z',
      href: '/cpc?utm_source=cpc',
      referrer: ''
    }
  ],
  visits: 1
})
```

### References
[Counting web sessions with JavaScript](https://swizec.com/blog/counting-web-sessions-javascript/swizec/7598) by @Swizec  
[How a web session is defined in Analytics](https://support.google.com/analytics/answer/2731565?hl=en)
