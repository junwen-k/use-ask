import type { UseAskResult, UseAskReturn } from './use-ask'

/**
 * Observable store for "ask" implementation.
 */
export class AskStore<P, TData = unknown, TReason = unknown> {
  store: UseAskReturn<TData, TReason>[1] & {
    key: number
    props: P
  }
  subscribers: Array<() => void>

  constructor() {
    this.store = {
      key: 0,
      props: {} as P,
      asking: false,
      cancel: () => {},
      ok: () => {},
    }
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
    this.store = {
      ...this.store,
      asking: false,
      cancel: () => {},
      ok: () => {},
    }
    this.notify()
  }

  start(safe: true, props: P): Promise<UseAskResult<TData, TReason>>
  start(safe: false, props: P): Promise<TData>
  start(safe: boolean, props: P) {
    const { promise, resolve, reject } = Promise.withResolvers()

    this.store = {
      key: this.store.key + 1,
      props,
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
    }
    this.notify()

    return promise
  }

  ask = (props: P) => this.start(false, props)

  safeAsk = (props: P) => this.start(true, props)
}
