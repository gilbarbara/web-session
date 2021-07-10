export type AnyObject<T = any> = Record<string, T>;
export type NarrowPlainObject<T> = Exclude<T, any[] | ((...items: any[]) => any)>;

export interface Origin {
  createdAt: string;
  href: string;
  referrer: string;
}

export interface CurrentSession {
  campaign: Record<string, string>;
  expiresAt: string;
  href: string;
  referrer: string;
}

export interface Options {
  callback: (session: Session) => void;
  duration: number;
  historySize: number;
  name: string;
  timezone: string;
}

export interface Session {
  current: CurrentSession;
  data?: AnyObject;
  history: Origin[];
  origin: Origin;
  visits: number;
}
