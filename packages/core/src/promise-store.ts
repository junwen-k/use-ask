type UseAskResult<TData = unknown, TReason = unknown> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      reason: TReason;
    };

type UseAskReturn<TData = unknown, TReason = unknown> = [
  {
    ask: () => Promise<TData>;
    safeAsk: () => Promise<UseAskResult<TData, TReason>>;
  },
  {
    pending: boolean;
    cancel: (reason?: TReason) => void;
    ok: (data?: TData) => void;
  },
];

export class PromiseStore<P, TData = unknown, TReason = unknown> {
  private store: [
    {
      key: number;
      payload: P;
    },
    UseAskReturn<TData, TReason>[1],
  ];
  private subscribers: Set<() => void>;

  constructor(initialPayload?: P) {
    this.store = [
      {
        key: 0,
        payload: initialPayload as P,
      },
      {
        pending: false,
        cancel: () => {},
        ok: () => {},
      },
    ];
    this.subscribers = new Set();
  }

  getSnapshot = () => this.store;

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: () => void) => {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  notify = () => {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  };

  end = () => {
    this.store = [
      this.store[0],
      {
        pending: false,
        cancel: () => {
          // noop
        },
        ok: () => {
          // noop
        },
      },
    ];
    this.notify();
  };

  private start(safe: true, payload: P): Promise<UseAskResult<TData, TReason>>;
  private start(safe: false, payload: P): Promise<TData>;
  private start(safe: boolean, payload: P) {
    const { promise, resolve, reject } = Promise.withResolvers();

    this.store = [
      {
        key: this.store[0].key + 1,
        payload,
      },
      {
        pending: !!resolve && !!reject,
        cancel: (reason?: TReason) => {
          if (safe) {
            resolve({ ok: false, reason: reason as TReason });
          } else {
            reject(reason);
          }
          this.end();
        },
        ok: (data?: TData) => {
          if (safe) {
            resolve({ ok: true, data: data as TData });
          } else {
            resolve(data);
          }
          this.end();
        },
      },
    ];
    this.notify();

    return promise;
  }

  create = (payload: P) => this.start(false, payload);

  safeCreate = (payload: P) => this.start(true, payload);
}
