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
      return;
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
        href: this.getLocation(),
        referrer: document.referrer,
      },
      current: {
        campaign: this.getCampaign(),
        expiresAt: this.getExpirationDate(),
        href: this.getLocation(),
        referrer: document.referrer,
      },
      history: [],
      visits: 0,
    };

    this.update();
  }

  getLocation(location = window.location) {
    const { hash, pathname, search } = location;

    return `${pathname}${search}${hash}`;
  }

  getCampaign(search = window.location.search) {
    const { current } = this.session;
    const campaign = current ? current.campaign : {};

    if (!search) {
      return campaign;
    }

    const nextCampaign = parseQuery(search)
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

  getExpirationDate() {
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

    return !shallowCompare(current.campaign, this.getCampaign());
  }

  hasSession() {
    return !!storage.get(this.options.name);
  }

  setSession(data) {
    /* istanbul ignore else */
    const { current, history, origin, visits } = this.session;

    const nextSession = {
      ...data,
      origin,
      current: {
        ...current,
        expiresAt: this.getExpirationDate(),
      },
      history,
      visits,
    };

    if (this.isNewSession()) {
      nextSession.current = {
        href: this.getLocation(),
        campaign: this.getCampaign(),
        expiresAt: this.getExpirationDate(),
        referrer: document.referrer,
      };
      nextSession.visits += 1;
    }

    if (this.hasNewCampaign()) {
      nextSession.history.push({
        createdAt: this.date.toISO(),
        href: this.getLocation(),
        referrer: document.referrer,
      });
    }

    this.sessionData = nextSession;
    this.options.callback(nextSession);
    storage.set(this.options.name, nextSession);
  }

  update = () => {
    this.setSession(this.sessionData);
  };

  get session() {
    return this.sessionData || {};
  }

  get date() {
    return DateTime.local().setZone(this.options.timezone);
  }
}
