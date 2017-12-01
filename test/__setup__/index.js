Object.defineProperty(window.location, 'href', {
  writable: true,
  value: 'http://localhost:3000/',
});

Object.defineProperty(window.location, 'pathname', {
  writable: true,
  value: '/',
});

Object.defineProperty(window.location, 'search', {
  writable: true,
  value: '',
});

Object.defineProperty(window, 'open', {
  writable: true,
  value: '',
});

Object.defineProperty(Element.prototype, 'clientHeight', {
  writable: true,
  value: '',
});

Object.defineProperty(Element.prototype, 'clientWidth', {
  writable: true,
  value: '',
});
