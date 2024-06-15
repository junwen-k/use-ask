# useAsk &middot; [![License](https://img.shields.io/github/license/junwen-k/use-ask)](https://github.com/junwen-k/use-ask/blob/main/LICENSE) [![Build Status](https://img.shields.io/github/actions/workflow/status/junwen-k/use-ask/ci.yml?branch=main)](https://github.com/junwen-k/use-ask/actions) [![Total Downloads](https://img.shields.io/npm/dm/use-ask)](https://www.npmjs.com/package/use-ask)

Create asynchronous imperative forms of "asking" with ease, including implementations like [`confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) or [`prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt).

## Features

- 🛠️ Fully typesafe
- ✅ Headless, minimalist, bring your own UI
- 🪄 Works without a top-level context provider

## Installation

To install the hook, run:

```bash
npm install use-ask
```

## Usage

You can start the "ask" process by calling `ask` or `safeAsk`. These functions return a promise that resolves or rejects depending on whether `ok` or `cancel` is called.

Check out [examples](#examples) section for more examples using popular UI libraries.

### Global Usage

Create a `<Confirmer />` component using `createAsk()`.

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { createAsk } from 'use-ask'

// The payload for this implementation is a basic message string.
// You can use an object as payload to render your confirm dialog.
const [confirmStore, useConfirmStore] = createAsk<string, boolean>()

export const confirm = confirmStore.ask

export const safeConfirm = confirmStore.safeAsk

export const Confirmer = () => {
  const [{ key, payload: message }, { asking, cancel, ok }] = useConfirmStore()

  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (asking) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [asking])

  return (
    // We are using native <dialog> element for brevity, but you can customise the UI however you want.
    <dialog key={key} ref={dialogRef} onCancel={cancel}>
      <p>{message}</p>
      <button onClick={cancel}>Cancel</button>
      <button onClick={() => ok(true)}>OK</button>
    </dialog>
  )
}
```

Add `<Confirmer />` to your app, it will be the place where your confirm dialog will be rendered. After that you can use `confirm()` from anywhere in your app.

```tsx
import { Confirmer, confirm } from '@/components/confirmer'

// ...

function App() {
  return (
    <div>
      <Confirmer />
      <button
        onClick={() =>
          confirm('Are you sure?')
            .then(() => alert('Deleted!'))
            .catch(() => alert('Cancelled!'))
        }
      >
        Delete
      </button>
    </div>
  )
}
```

### One-off Usage

You can also create a one-off use case by using `useAsk` directly. Since the hook is headless, you can render a `<Popover>` as well.

```tsx
const Page = () => {
  const [{ ask }, { asking, cancel, ok }] = useAsk<string, Error>() // We specify the data type to be `string`, and cancel reason to be `Error`.

  return (
    <Popover open={asking} onOpenChange={(open) => !open && cancel()}>
      <PopoverPrimitive.Anchor asChild>
        <Button
          onClick={() =>
            ask()
              .then((message) => alert(`Confirmed with message "${message}"`))
              // Error is `any` instead of `Error` by design. For more information, see https://github.com/Microsoft/TypeScript/issues/6283#issuecomment-240804072.
              .catch((error) => alert(`Cancelled with message "${error.message}"`))
          }
        >
          Delete
        </Button>
      </PopoverPrimitive.Anchor>
      <PopoverContent side="right">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => cancel(new Error('No good!'))}
          >
            Cancel
          </Button>
          <Button className="w-full" onClick={() => ok('All good!')}>
            Continue
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

### Polyfill

This library uses [Promise.withResolvers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) under the hood, which is supported on most [modern browsers](https://caniuse.com/mdn-javascript_builtins_promise_withresolvers). If you need to support older browsers, consider checking out [ungap/with-resolvers](https://github.com/ungap/with-resolvers).

## Examples

- [**joy-ui-vite**](./examples/joy-ui-vite): [Vite](https://vitejs.dev/) React app with confirmation dialog using [Joy UI](https://mui.com/joy-ui/getting-started/).
- [**shadcn-ui-nextjs**](./examples/shadcn-ui-nextjs): [Nextjs](https://nextjs.org/) app with confirmation alert dialog / popover using [Shadcn UI](https://ui.shadcn.com/).

## Acknowledgements

- [**material-ui-confirm**](https://github.com/jonatanklosko/material-ui-confirm) ([Jonatan Kłosko](https://github.com/jonatanklosko))
  This library provided the initial inspiration for promisifying and creating an imperative method for confirm / prompt dialogs.
- [**sonner**](https://github.com/emilkowalski/sonner) ([Emil Kowalski](https://emilkowal.ski/))
  Inspired the use of the observer pattern for a global store, eliminating the need for a top-level provider.
- [**use-confirm**](https://github.com/tsivinsky/use-confirm) ([Daniil Tsivinsky](https://tsivinsky.com))
  This project influenced the naming `asking`, offering a more generic approach to implementation.
- [**zod**](https://github.com/colinhacks/zod) ([Colin McDonnell](https://colinhacks.com/))
  Inspired the design of `ask` and `safeAsk` variants for error throwing and non-throwing APIs.
