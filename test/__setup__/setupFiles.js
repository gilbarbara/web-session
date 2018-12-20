import 'jest-localstorage-mock';

global.navigate = (options = {}) => {
  const { pathname = location.pathname, search, hash } = options;
  let url = `${location.protocol}//${location.host}${pathname}`;

  if (search) {
    url += `?${search}`;
  }

  if (hash) {
    url += `#${hash}`;
  }

  jsdom.reconfigure({ url });
};

global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

global.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
});
