declare let window: any;

interface Options {
  hash?: string;
  pathname: string;
  search?: string;
}

export function navigate(options?: Options) {
  const { pathname = location.pathname, search, hash } = options || {};
  let url = `${location.protocol}//${location.host}${pathname}`;

  if (search) {
    url += `?${search}`;
  }

  if (hash) {
    url += `#${hash}`;
  }

  window.location.assign(url);
}
