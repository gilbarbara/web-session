import 'jest-location-mock';

window.navigate = (options = {}) => {
  const { pathname = location.pathname, search, hash } = options;
  let url = `${location.protocol}//${location.host}${pathname}`;

  if (search) {
    url += `?${search}`;
  }

  if (hash) {
    url += `#${hash}`;
  }

  window.location.assign(url);
};

window.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

window.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
});
