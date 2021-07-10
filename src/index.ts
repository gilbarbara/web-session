import { DateTime } from 'luxon';

import { defaultOptions, hasLocalStorage, parseQuery, shallowCompare, storage } from './helpers';
import { AnyObject, NarrowPlainObject, Options, Session } from './types';

export default class WebSession {
  private readonly defaultOptions = defaultOptions;
  private readonly options: Options;
  private sessionData: Session;

  constructor(options?: Partial<Options>) {
    if (!hasLocalStorage()) {
      // eslint-disable-next-line no-console
      console.error('localStorage is not supported');
    }

    this.options = {
      ...this.defaultOptions,
      ...options,
    };

    this.sessionData = storage.get(this.options.name || '') || {
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

  update = <T = AnyObject>(data?: T & NarrowPlainObject<T>, replaceData = false) => {
    /* istanbul ignore else */
    const { current, data: currentData, origin, visits } = this.session;

    const nextSession: Session = {
      origin,
      current: {
        ...current,
        expiresAt: this.expirationDate,
      },
      history: this.history,
      visits,
    };

    nextSession.data = replaceData
      ? data
      : {
          ...currentData,
          ...data,
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
  };

  get campaign() {
    const { current } = this.session;
    const campaign = current ? current.campaign : {};

    if (!window.location.search) {
      return campaign;
    }

    const nextCampaign = parseQuery(window.location.search).reduce((accumulator, [key, value]) => {
      /* istanbul ignore else */
      if (key.startsWith('utm_')) {
        accumulator[key.slice(4)] = value;
      }

      if (key.startsWith('gclid')) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {} as AnyObject);

    if (Object.keys(nextCampaign).length) {
      return nextCampaign;
    }

    return campaign;
  }

  get date() {
    return DateTime.local().setZone(this.options.timezone);
  }

  get expirationDate() {
    return this.date.plus({ minutes: this.options.duration }).toISO();
  }

  get history() {
    const { history } = this.session;
    const { historySize } = this.options;

    return historySize ? history.slice(history.length - historySize, historySize) : history;
  }

  get href() {
    const { hash, pathname, search } = window.location;

    return `${pathname}${search}${hash}`;
  }

  get session() {
    return this.sessionData || {};
  }

  getDateFromISO(date: string) {
    return DateTime.fromISO(date).setLocale(this.options.timezone);
  }

  isExpired() {
    const { current } = this.session;

    const expiresAt = this.getDateFromISO(current.expiresAt);
    const issuedAt = expiresAt.minus({ minutes: this.options.duration });

    return this.date.toISODate() !== issuedAt.toISODate() || expiresAt < this.date;
  }

  isNewSession() {
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

export * from './types';
