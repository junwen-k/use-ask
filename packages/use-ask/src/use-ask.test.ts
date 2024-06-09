import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAsk, type UseAskReturn } from './use-ask'

// We polyfill `Promise.withResolvers` because it is not available in Node environment.
// For more information, see https://github.com/vitest-dev/vitest/discussions/5512#discussioncomment-9054811.
import '@ungap/with-resolvers'

it('should initialize correctly', () => {
  const { result } = renderHook(() => useAsk())
  const [{ ask, safeAsk }, { asking, cancel, ok }] = result.current

  expect(ask).toBeInstanceOf(Function)
  expect(safeAsk).toBeInstanceOf(Function)
  expect(cancel).toBeInstanceOf(Function)
  expect(ok).toBeInstanceOf(Function)
  expect(asking).toBe(false)
})

interface SafeAskTestContext<TData = unknown, TReason = unknown> {
  result: RenderHookResult<ReturnType<typeof useAsk<TData, TReason>>, unknown>['result']
  answerPromise: ReturnType<UseAskReturn<TData, TReason>[0]['safeAsk']>
}

describe('safeAsk', () => {
  beforeEach<SafeAskTestContext>((context) => {
    const { result } = renderHook(() => useAsk())

    let answerPromise: ReturnType<(typeof result.current)[0]['safeAsk']>

    act(() => {
      answerPromise = result.current[0].safeAsk()
    })

    context.result = result
    context.answerPromise = answerPromise!
  })

  it<
    SafeAskTestContext<{ message: string }>
  >('should resolve with data when promise resolves', async ({ result, answerPromise }) => {
    expect(result.current[1].asking).toBe(true)

    act(() => {
      result.current[1].ok({ message: 'success' })
    })

    await expect(answerPromise).resolves.toEqual({ ok: true, data: { message: 'success' } })
    expect(result.current[1].asking).toBe(false)
  })

  it<SafeAskTestContext>('should resolve without throwing when promise is cancelled without reason', async ({
    result,
    answerPromise,
  }) => {
    expect(result.current[1].asking).toBe(true)

    act(() => {
      result.current[1].cancel()
    })

    await expect(answerPromise).resolves.toEqual({ ok: false, reason: undefined })
    expect(result.current[1].asking).toBe(false)
  })

  it<
    SafeAskTestContext<never, Error>
  >('should resolve with custom reason when promise is cancelled with a reason', async ({
    result,
    answerPromise,
  }) => {
    expect(result.current[1].asking).toBe(true)

    act(() => {
      result.current[1].cancel(new Error('reason'))
    })

    await expect(answerPromise).resolves.toEqual({ ok: false, reason: new Error('reason') })
    expect(result.current[1].asking).toBe(false)
  })
})

interface AskTestContext<TData = unknown, TReason = unknown> {
  result: RenderHookResult<ReturnType<typeof useAsk<TData, TReason>>, unknown>['result']
  answerPromise: ReturnType<UseAskReturn<TData, TReason>[0]['ask']>
}

describe('ask', () => {
  beforeEach<AskTestContext>((context) => {
    const { result } = renderHook(() => useAsk())

    let answerPromise: ReturnType<(typeof result.current)[0]['ask']>

    act(() => {
      answerPromise = result.current[0].ask()
    })

    context.result = result
    context.answerPromise = answerPromise!
  })

  it<AskTestContext<{ message: string }>>('should resolve with data when promise resolves', async ({
    result,
    answerPromise,
  }) => {
    expect(result.current[1].asking).toBe(true)

    act(() => {
      result.current[1].ok({ message: 'success' })
    })

    await expect(answerPromise).resolves.toEqual({ message: 'success' })
    expect(result.current[1].asking).toBe(false)
  })

  it<AskTestContext>('should reject when promise is cancelled without reason', async ({
    result,
    answerPromise,
  }) => {
    expect(result.current[1].asking).toBe(true)

    act(() => {
      result.current[1].cancel()
    })

    await expect(answerPromise).rejects.toBeUndefined()
    expect(result.current[1].asking).toBe(false)
  })

  it<
    AskTestContext<never, Error>
  >('should reject with custom reason when promise is cancelled with a reason', async ({
    result,
    answerPromise,
  }) => {
    expect(result.current[1].asking).toBe(true)

    act(() => {
      result.current[1].cancel(new Error('reason'))
    })

    await expect(answerPromise).rejects.toEqual(new Error('reason'))
    expect(result.current[1].asking).toBe(false)
  })
})
