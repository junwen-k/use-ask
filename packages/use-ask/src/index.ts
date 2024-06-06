'use client'

import { useCallback, useState } from 'react'

export type UseAskState<TData = unknown, TReason = unknown> =
  | {
      resolve?: undefined
      reject?: undefined
      safe?: undefined
    }
  | {
      resolve: (data?: TData) => void
      reject: (reason?: TReason) => void
      safe: false
    }
  | {
      resolve: (data: UseAskResult<TData, TReason>) => void
      reject: never
      safe: true
    }

export type UseAskResult<TData = unknown, TReason = unknown> =
  | {
      ok: true
      data: TData
    }
  | {
      ok: false
      reason: TReason
    }

export type UseAskReturn<TData = unknown, TReason = unknown> = [
  {
    ask: () => Promise<TData>
    safeAsk: () => Promise<UseAskResult<TData, TReason>>
  },
  {
    asking: boolean
    cancel: (reason?: TReason) => void
    ok: (data?: TData) => void
  },
]

export const useAsk = <TData = unknown, TReason = unknown>(): UseAskReturn<TData, TReason> => {
  const [{ resolve, reject, safe }, setState] = useState<UseAskState<TData, TReason>>({})

  const start = useCallback(<Safe extends boolean>(safe: Safe) => {
    const { promise, resolve, reject } =
      Promise.withResolvers<Safe extends true ? UseAskResult<TData, TReason> : TData>()

    setState({
      resolve,
      reject,
      safe,
    } as UseAskState<TData, TReason>)

    return promise
  }, [])

  const end = useCallback(() => setState({}), [])

  const ask = useCallback(() => start(false), [start])

  const safeAsk = useCallback(() => start(true), [start])

  const cancel = useCallback(
    (reason?: TReason) => {
      if (safe === undefined) {
        return
      }
      if (safe) {
        resolve({ ok: false, reason: reason as TReason })
      } else {
        reject(reason)
      }
      end()
    },
    [resolve, reject, safe, end]
  )

  const ok = useCallback(
    (data?: TData) => {
      if (safe === undefined) {
        return
      }
      if (safe) {
        resolve({ ok: true, data: data as TData })
      } else {
        resolve(data)
      }
      end()
    },
    [resolve, safe, end]
  )

  return [
    { ask, safeAsk },
    {
      asking: !!resolve && !!reject,
      cancel,
      ok,
    },
  ]
}
