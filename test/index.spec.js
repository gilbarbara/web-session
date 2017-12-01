import lolex from 'lolex';
import WebSession from '../src/index';

const mockCallback = jest.fn();

function cleanUp() {
  window.location.pathname = '/';
  window.location.search = '';
  localStorage.clear();
  mockCallback.mockClear();
}

describe('WebSession', () => {
  let webSession;
  let clock;

  describe('using the default options', () => {
    beforeAll(() => {
      cleanUp();

      clock = lolex.install({
        now: new Date('1999-12-31 23:15:00'),
      });

      webSession = new WebSession({
        callback: mockCallback,
      });
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.session)
        .toEqual({
          current: {
            campaign: {},
            expiresAt: '1999-12-31T23:45:00.000Z',
            href: '/',
            referrer: '',
          },
          origin: {
            createdAt: '1999-12-31T23:15:00.000Z',
            href: '/',
            referrer: '',
          },
          history: [],
          visits: 1
        });
    });

    it('should have created the storage items', () => {
      expect(JSON.parse(localStorage.getItem('WebSessionData'))).toEqual(webSession.session);
    });

    it('should extend the session by 15 seconds', () => {
      const { current } = webSession.session;
      clock.tick('15');

      webSession.update();

      const { current: next } = webSession.session;

      expect(current.expiresAt !== next.expiresAt).toBe(true);
      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should still be in the same session after 5 minutes', () => {
      clock.tick('05:00');
      window.location.pathname = '/b';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should start a new session after 30 minutes', () => {
      clock.tick('31:00');
      window.location.pathname = '/c';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(2);
    });

    it('should start a new session after midnight', () => {
      clock.tick('10:00');
      window.location.pathname = '/e';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should still be in the same session after 10 minutes', () => {
      clock.tick('10:00');
      window.location.pathname = '/g';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should have started a new session after 10 minutes because there\'s a campaign', () => {
      clock.tick('10:00');

      // this will be the first campaign
      expect(webSession.session.history.length).toBe(0);

      window.location.pathname = '/cpc';
      window.location.search = '?utm_source=cpc';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
      expect(webSession.session.history.length).toBe(1);
    });

    it('should still be in the same session after 5 minutes with a new query but no campaign', () => {
      clock.tick('05:00');
      window.location.pathname = '/photos';
      window.location.search = '?color=red';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
    });

    it('should still be in the same session after 5 but no params', () => {
      clock.tick('05:00');
      window.location.pathname = '/about';
      window.location.search = '';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
    });

    it('should have started a new session after 10 minutes but with a new campaign', () => {
      clock.tick('10:00');
      window.location.pathname = '/affiliate';
      window.location.search = '?utm_source=affiliate';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.history.length).toBe(2);
      expect(webSession.session.visits).toBe(5);
    });

    it('should have started a new session after 60 minutes', () => {
      clock.tick('01:00:00');
      window.location.pathname = '/';
      window.location.search = '';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(6);
    });

    it('should have added a new campaign to the history', () => {
      clock.tick('10:00:00');
      window.location.pathname = '/promo';
      window.location.search = '?utm_source=promo';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.history.length).toBe(3);
      expect(webSession.session.visits).toBe(7);
    });
  });

  describe('with custom timezone', () => {
    beforeAll(() => {
      cleanUp();

      clock = lolex.install({
        now: new Date('1999-12-31 23:15:00'),
      });

      webSession = new WebSession({
        callback: mockCallback,
        timezone: 'America/New_York',
      });
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.session)
        .toEqual({
          current: {
            campaign: {},
            expiresAt: '1999-12-31T18:45:00.000-05:00',
            href: '/',
            referrer: '',
          },
          origin: {
            createdAt: '1999-12-31T18:15:00.000-05:00',
            href: '/',
            referrer: '',
          },
          history: [],
          visits: 1
        });
    });

    it('should still be in the same session after 5 minutes', () => {
      clock.tick('05:00');
      window.location.pathname = '/b';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should start a new session after 30 minutes', () => {
      clock.tick('31:00');
      window.location.pathname = '/c';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(2);
    });

    it('should start a new session a few hours later', () => {
      clock.tick('04:30:00');
      window.location.pathname = '/e';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should start a new session after midnight', () => {
      clock.tick('10:00');
      window.location.pathname = '/f';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
    });
  });

  describe('using custom duration (60)', () => {
    beforeAll(() => {
      cleanUp();

      clock = lolex.install({
        now: new Date('1999-12-31 21:15:00'),
      });

      webSession = new WebSession({
        callback: mockCallback,
        duration: 60,
      });
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.session)
        .toEqual({
          current: {
            campaign: {},
            expiresAt: '1999-12-31T22:15:00.000Z',
            href: '/',
            referrer: '',
          },
          origin: {
            createdAt: '1999-12-31T21:15:00.000Z',
            href: '/',
            referrer: '',
          },
          history: [],
          visits: 1
        });
    });

    it('should still be in the same session after 45 minutes', () => {
      clock.tick('45:00');
      window.location.pathname = '/b';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should start a new session after 60 minutes', () => {
      clock.tick('01:15:00');
      window.location.pathname = '/c';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(2);
    });

    it('should start a new session after midnight', () => {
      clock.tick('45:00');
      window.location.pathname = '/e';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should still be in the same session after 10 minutes', () => {
      clock.tick('50:00');
      window.location.pathname = '/f';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });
  });

  describe('without localStorage', () => {
    beforeAll(() => {
      window.isLocalStorageSupported = false;
      cleanUp();

      clock = lolex.install({
        now: new Date('1999-12-31 23:15:00'),
      });

      webSession = new WebSession();
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.session).toEqual({});
    });
  });
});

