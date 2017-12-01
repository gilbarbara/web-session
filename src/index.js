import { DateTime } from 'luxon';
import {
  hasLocalStorage,
  parseQuery,
  shallowCompare,
  storage,
} from './utils';

export default class WebSession {
  constructor(options) {
    if (!hasLocalStorage()) {
      console.error('localStorage is not supported'); //eslint-disable-line no-console
    }

    this.defaultOptions = {
      callback: () => {},
      duration: 30,
      name: 'WebSessionData',
      timezone: 'UTC',
    };

    this.init(options);
  }

  init(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };

    this.sessionData = storage.get(this.options.name) || {
      origin: {
        createdAt: this.date.toISO(),
        href: this.href,
        referrer: document.referrer,
      },
      current: {
        campaign: this.campaign,
        expiresAt: this.expirationDate,
        href: this.href,
        referrer: document.referrer,
      },
      history: [],
      visits: 0,
    };

    this.update();
  }

  update(data) {
    /* istanbul ignore else */
    const { current, history, origin, visits } = this.session;

    const nextSession = {
      ...data,
      origin,
      current: {
        ...current,
        expiresAt: this.expirationDate,
      },
      history,
      visits,
    };

    if (this.isNewSession()) {
      nextSession.current = {
        href: this.href,
        campaign: this.campaign,
        expiresAt: this.expirationDate,
        referrer: document.referrer,
      };
      nextSession.visits += 1;
    }

    if (this.hasNewCampaign()) {
      nextSession.history.push({
        createdAt: this.date.toISO(),
        href: this.href,
        referrer: document.referrer,
      });
    }

    this.sessionData = nextSession;
    this.options.callback(nextSession);
    storage.set(this.options.name, nextSession);
  }

  get session() {
    return this.sessionData || {};
  }

  get date() {
    return DateTime.local().setZone(this.options.timezone);
  }

  get href() {
    const { hash, pathname, search } = window.location;

    return `${pathname}${search}${hash}`;
  }

  get campaign() {
    const { current } = this.session;
    const campaign = current ? current.campaign : {};

    if (!window.location.search) {
      return campaign;
    }

    const nextCampaign = parseQuery(window.location.search)
      .reduce((acc, [key, value]) => {
        /* istanbul ignore else */
        if (key.startsWith('utm_')) {
          acc[key.slice(4)] = value;
        }

        if (key.startsWith('gclid')) {
          acc[key] = value;
        }

        return acc;
      }, {});

    if (Object.keys(nextCampaign).length) {
      return nextCampaign;
    }

    return campaign;
  }

  get expirationDate() {
    return this.date.plus({ minutes: this.options.duration }).toISO();
  }

  getDateFromISO(iso) {
    return DateTime.fromISO(iso).setLocale(this.options.timezone);
  }

  isExpired() {
    const { current } = this.session;

    const expiresAt = this.getDateFromISO(current.expiresAt);
    const issuedAt = expiresAt.minus({ minutes: this.options.duration });

    return (this.date.toISODate() !== issuedAt.toISODate()) || (expiresAt < this.date);
  }

  isNewSession() {
    /*
    if (
      [
        !this.hasSession(),
        this.hasNewCampaign(),
        this.isExpired(), // a new day
      ].some(d => d)
    ) {
      console.log({
        '!hasSession': !this.hasSession(),
        'hasNewCampaign': this.hasNewCampaign(),
        'is expired': this.isExpired(),
      });
    }
    */

    return [
      !this.hasSession(),
      this.hasNewCampaign(), // campaign has changed
      this.isExpired(), // session expired
    ].some(d => d);
  }

  hasNewCampaign() {
    const { current } = this.session;

    return !shallowCompare(current.campaign, this.campaign);
  }

  hasSession() {
    return !!storage.get(this.options.name);
  }
}
