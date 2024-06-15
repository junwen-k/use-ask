import type { UseAskResult, UseAskReturn } from './use-ask'

/**
 * Observable store for "ask" implementation.
 */
export class AskStore<P, TData = unknown, TReason = unknown> {
  store: [
    {
      key: number
      payload: P
    },
    UseAskReturn<TData, TReason>[1],
  ]
  subscribers: Array<() => void>

  constructor(initialPayload?: P) {
    this.store = [
      {
        key: 0,
        payload: initialPayload as P,
      },
      {
        asking: false,
        cancel: () => {},
        ok: () => {},
      },
    ]
    this.subscribers = []
  }

  getSnapshot = () => this.store

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: () => void) => {
    this.subscribers.push(subscriber)

    return () => {
      const index = this.subscribers.indexOf(subscriber)
      this.subscribers.splice(index, 1)
    }
  }

  notify = () => {
    this.subscribers.forEach((subscriber) => subscriber())
  }

  end = () => {
    this.store = [
      this.store[0],
      {
        asking: false,
        cancel: () => {},
        ok: () => {},
      },
    ]
    this.notify()
  }

  private start(safe: true, payload: P): Promise<UseAskResult<TData, TReason>>
  private start(safe: false, payload: P): Promise<TData>
  private start(safe: boolean, payload: P) {
    const { promise, resolve, reject } = Promise.withResolvers()

    this.store = [
      {
        key: this.store[0].key + 1,
        payload,
      },
      {
        asking: !!resolve && !!reject,
        cancel: (reason?: TReason) => {
          if (safe) {
            resolve({ ok: false, reason: reason as TReason })
          } else {
            reject(reason)
          }
          this.end()
        },
        ok: (data?: TData) => {
          if (safe) {
            resolve({ ok: true, data: data as TData })
          } else {
            resolve(data)
          }
          this.end()
        },
      },
    ]
    this.notify()

    return promise
  }

  ask = (payload: P) => this.start(false, payload)

  safeAsk = (payload: P) => this.start(true, payload)
}
