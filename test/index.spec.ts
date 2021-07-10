import { advanceBy, advanceTo, clear } from 'jest-date-mock';

import { navigate } from './__setup__/utils';

import WebSession from '../src';

const mockCallback = jest.fn();

function cleanUp() {
  navigate({ pathname: '/' });
  localStorage.clear();
  mockCallback.mockClear();
}

function getSession(
  data = {},
  createdAt = '1999-12-31T23:15:00.000Z',
  expiresAt = '1999-12-31T23:45:00.000Z',
) {
  return {
    current: {
      campaign: {},
      expiresAt,
      href: '/',
      referrer: '',
    },
    data: {},
    origin: {
      createdAt,
      href: '/',
      referrer: '',
    },
    history: [],
    visits: 1,
    ...data,
  };
}

function tick(input: number, inMinutes?: boolean) {
  let value = input;

  if (inMinutes) {
    value = input * 60;
  }

  advanceBy(value * 1000);
}

describe('WebSession', () => {
  let webSession: WebSession;

  describe('with the default options', () => {
    beforeAll(() => {
      cleanUp();

      advanceTo(new Date('1999-12-31 23:15:00'));

      webSession = new WebSession({
        callback: mockCallback,
      });
    });

    afterAll(() => {
      clear();
    });

    it('should start a new session', () => {
      expect(webSession.session).toEqual(getSession());
    });

    it('should have created the storage items', () => {
      expect(JSON.parse(localStorage.getItem('WebSessionData') || '')).toEqual(webSession.session);
    });

    it('should extend the session by 15 seconds', () => {
      const { current } = webSession.session;

      tick(15);

      webSession.update();

      const { current: next } = webSession.session;

      expect(current.expiresAt !== next.expiresAt).toBe(true);
      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should still be in the same session after 5 minutes', () => {
      tick(5, true);
      navigate({ pathname: '/b' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should start a new session after 30 minutes', () => {
      tick(31, true);
      navigate({ pathname: '/c' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(2);
    });

    it('should start a new session after midnight', () => {
      tick(10, true);
      navigate({ pathname: '/e' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should still be in the same session after 10 minutes', () => {
      tick(10, true);
      navigate({ pathname: '/g' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it("should have started a new session after 10 minutes because there's a campaign", () => {
      // this will be the first campaign
      expect(webSession.session.history).toHaveLength(0);

      tick(10, true);
      navigate({ pathname: '/cpc', search: 'utm_source=cpc' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
      expect(webSession.session.history).toHaveLength(1);
    });

    it('should still be in the same session after 5 minutes with a new query but no campaign', () => {
      tick(5, true);
      navigate({ pathname: '/photos', search: 'color=red' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
    });

    it('should still be in the same session after 5 but no params', () => {
      tick(5, true);
      navigate({ pathname: '/about' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
    });

    it('should have started a new session after 10 minutes but with a new campaign', () => {
      tick(10, true);
      navigate({ pathname: '/affiliate', search: 'utm_source=affiliate' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.history).toHaveLength(2);
      expect(webSession.session.visits).toBe(5);
    });

    it('should have started a new session after 60 minutes', () => {
      tick(60, true);
      navigate();

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(6);
    });

    it('should have added a new campaign to the history', () => {
      tick(600, true);
      navigate({ pathname: '/products/1234', search: 'gclid=3097hds92ghsd775sg72sg256rs2s35d3' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.history).toHaveLength(3);
      expect(webSession.session.visits).toBe(7);
    });
  });

  describe('with custom timezone', () => {
    beforeAll(() => {
      cleanUp();

      advanceTo(new Date('1999-12-31 23:15:00'));

      webSession = new WebSession({
        callback: mockCallback,
        timezone: 'America/New_York',
      });
    });

    afterAll(() => {
      clear();
    });

    it('should start a new session', () => {
      expect(webSession.session).toEqual(
        getSession({}, '1999-12-31T18:15:00.000-05:00', '1999-12-31T18:45:00.000-05:00'),
      );
    });

    it('should still be in the same session after 5 minutes', () => {
      tick(5, true);
      navigate({ pathname: '/b' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should start a new session after 30 minutes', () => {
      tick(31, true);
      navigate({ pathname: '/c' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(2);
    });

    it('should start a new session a few hours later', () => {
      tick(270, true);
      navigate({ pathname: '/e' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should start a new session after midnight', () => {
      tick(10, true);
      navigate({ pathname: '/f' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(4);
    });
  });

  describe('with custom duration (60)', () => {
    beforeAll(() => {
      cleanUp();

      advanceTo(new Date('1999-12-31 21:15:00'));

      webSession = new WebSession({
        callback: mockCallback,
        duration: 60,
      });
    });

    afterAll(() => {
      clear();
    });

    it('should start a new session', () => {
      expect(webSession.session).toEqual(
        getSession({}, '1999-12-31T21:15:00.000Z', '1999-12-31T22:15:00.000Z'),
      );
    });

    it('should still be in the same session after 45 minutes', () => {
      tick(45, true);
      navigate({ pathname: '/b' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(1);
    });

    it('should start a new session after 60 minutes', () => {
      tick(75, true);
      navigate({ pathname: '/c' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(2);
    });

    it('should start a new session after midnight', () => {
      tick(45, true);
      navigate({ pathname: '/e' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });

    it('should still be in the same session after 10 minutes', () => {
      tick(50, true);
      navigate({ pathname: '/f' });

      webSession.update();

      expect(mockCallback).toHaveBeenLastCalledWith(webSession.session);
      expect(webSession.session.visits).toBe(3);
    });
  });

  describe('with custom data', () => {
    beforeAll(() => {
      cleanUp();

      advanceTo(new Date('1999-12-31 23:15:00'));

      webSession = new WebSession({
        callback: mockCallback,
      });
      webSession.update({
        purchases: 1,
      });
    });

    afterAll(() => {
      clear();
    });

    it('should start a new session', () => {
      expect(webSession.session).toEqual(
        getSession({
          data: {
            purchases: 1,
          },
        }),
      );
    });

    it('should update session data', () => {
      webSession.update({ likes: 3 });
      webSession.update({ purchases: 2 });

      expect(webSession.session).toEqual(
        getSession({
          data: {
            likes: 3,
            purchases: 2,
          },
        }),
      );
    });

    it('should replace session data', () => {
      webSession.update({}, true);

      expect(webSession.session).toEqual(getSession());
    });
  });

  describe('without localStorage', () => {
    beforeAll(() => {
      window.isLocalStorageSupported = false;
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      cleanUp();

      advanceTo(new Date('1999-12-31 23:15:00'));

      webSession = new WebSession();
      webSession.update();
    });

    afterAll(() => {
      jest.restoreAllMocks();
      clear();
    });

    it('should start a new session', () => {
      expect(webSession.session).toEqual(getSession({ visits: 2 }));
    });
  });
});
