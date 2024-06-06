# useAsk

[![Build Status](https://img.shields.io/github/actions/workflow/status/junwen-k/use-ask/ci.yml?branch=main 'Build Status')](https://github.com/junwen-k/use-ask/actions)

[![Total Downloads](https://img.shields.io/npm/dm/use-ask 'Total Downloads')](https://www.npmjs.com/package/use-ask)

[![License](https://img.shields.io/github/license/junwen-k/use-ask 'License')](https://github.com/junwen-k/use-ask/blob/main/LICENSE)

The `useAsk` hook is a headless, minimalist, and simple hook that allows users to easily build their own `confirm` and `prompt` implementations. It transforms these implementations into an async imperative form of "asking", making actions like these feel more natural to use.

## Installation

To install the hook, run:

```bash
npm install use-ask
```

## Usage

The `useAsk` hook is designed to help you easily build asynchronous confirmation and prompt dialogs. Its API is inspired by the native [window.confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) and [window.prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt).

You can start the "ask" process by calling `ask` or `safeAsk`. These functions return a promise that resolves or rejects depending on whether `ok` or `cancel` is called.

Check out [examples](#examples) section for more examples using other popular UI libraries.

### Global Usage

A common pattern is to have a provider wrapping your entire app and exposing functions like `confirm` for imperative confirmations. Since the hook is headless, you can render anything you want, often an alert dialog.

Here's an example with [Nextjs](https://nextjs.org/) and [Shadcn UI](https://ui.shadcn.com/).

1. Create an `AlertDialogConfirmProvider` component.

   `components/alert-dialog-confirm-provider.tsx`

   ```tsx
   'use client'

   import * as React from 'react'
   import { useAsk } from 'use-ask'

   import {
     AlertDialog,
     AlertDialogCancel,
     AlertDialogContent,
     AlertDialogDescription,
     AlertDialogFooter,
     AlertDialogHeader,
     AlertDialogTitle,
   } from '@/components/ui/alert-dialog'
   import { Button } from '@/components/ui/button'

   const AlertDialogConfirmContext = React.createContext<{
     confirm: (options: AlertDialogConfirmActionOptions) => Promise<boolean>
     safeConfirm: (options: AlertDialogConfirmActionOptions) => Promise<boolean>
   }>({
     confirm: () => new Promise((resolve) => resolve(true)),
     safeConfirm: () => new Promise((resolve) => resolve(true)),
   })

   interface AlertDialogConfirmActionOptions {
     title?: React.ReactNode
     description?: React.ReactNode
     cancelText?: React.ReactNode
     actionText?: React.ReactNode
     CancelProps?: React.ComponentProps<typeof AlertDialogCancel>
     ActionProps?: React.ComponentProps<typeof Button>
   }

   const defaultOptions = {
     title: 'Are you sure?',
     cancelText: 'Cancel',
     actionText: 'Continue',
   } as const satisfies AlertDialogConfirmActionOptions

   export const AlertDialogConfirmProvider = ({ children }: React.PropsWithChildren) => {
     const [{ ask: asyncConfirm, safeAsk: asyncSafeConfirm }, { asking, cancel, ok }] =
       useAsk<boolean>()

     const [options, setOptions] = React.useState<AlertDialogConfirmActionOptions>({})
     const [key, setKey] = React.useState(0)

     const handleConfirm = React.useCallback(
       (options: AlertDialogConfirmActionOptions = {}, safe?: boolean) => {
         setKey((prevKey) => prevKey + 1)
         setOptions({ ...defaultOptions, ...options })

         return safe ? asyncSafeConfirm().then(({ ok }) => ok) : asyncConfirm()
       },
       [asyncConfirm, asyncSafeConfirm]
     )

     const confirm = React.useCallback(
       (options: AlertDialogConfirmActionOptions = {}) => handleConfirm(options),
       [handleConfirm]
     )

     const safeConfirm = React.useCallback(
       (options: AlertDialogConfirmActionOptions = {}) => handleConfirm(options, true),
       [handleConfirm]
     )

     return (
       <AlertDialogConfirmContext.Provider
         value={{
           confirm,
           safeConfirm,
         }}
       >
         {children}
         <AlertDialog key={key} open={asking} onOpenChange={(open) => !open && cancel()}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>{options.title}</AlertDialogTitle>
             </AlertDialogHeader>
             <AlertDialogDescription>{options.description}</AlertDialogDescription>
             <AlertDialogFooter>
               <AlertDialogCancel {...options.CancelProps}>{options.cancelText}</AlertDialogCancel>
               <Button {...options.ActionProps} onClick={() => ok(true)}>
                 {options.actionText}
               </Button>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       </AlertDialogConfirmContext.Provider>
     )
   }

   export const useAlertDialogConfirm = () => {
     const alertDialogConfirmContext = React.useContext(AlertDialogConfirmContext)
     if (!alertDialogConfirmContext) {
       throw new Error('useAlertDialogConfirm should be used within <AlertDialogConfirmProvider>')
     }
     return alertDialogConfirmContext
   }
   ```

1. Wrap your app with `AlertDialogConfirmProvider`.

   `app/layout.tsx`

   ```tsx
   import { AlertDialogConfirmProvider } from '@/components/alert-dialog-confirm-provider'

   const RootLayout = ({ children }: { children: React.ReactNode }) => {
     return (
       <html lang="en" suppressHydrationWarning>
         <head />
         <body>
           <AlertDialogConfirmProvider>{children}</AlertDialogConfirmProvider>
         </body>
       </html>
     )
   }
   ```

1. Import `useAlertDialogConfirm` and use it.

   `app/page.tsx`

   ```tsx
   import { useAlertDialogConfirm } from '@/components/alert-dialog-confirm-provider'

   const Example = () => {
     const { confirm } = useAlertDialogConfirm()

     return (
       <button
         onClick={() =>
           confirm()
             .then(() => alert('Confirmed'))
             .catch(() => alert('Cancelled'))
         }
       >
         Delete
       </button>
     )
   }
   ```

### One-off Usage

You can also create a one-off use case by using `useAsk` directly. Since the hook is headless, you can render a `Popover` as well.

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

- [Shadcn UI](./examples/shadcn-ui): [Nextjs](https://nextjs.org/) app with confirmation alert dialog / popover examples built with `useAsk` hook using [Shadcn UI](https://ui.shadcn.com/).

## Acknowledgements

- [**material-ui-confirm**](https://github.com/jonatanklosko/material-ui-confirm) ([Jonatan Kłosko](https://github.com/jonatanklosko))
  This library provided the initial inspiration for promisifying and creating an imperative method for confirm / prompt dialogs.
- [**use-confirm**](https://github.com/tsivinsky/use-confirm) ([Daniil Tsivinsky](https://tsivinsky.com))
  This project influenced the naming `asking`, offering a more generic approach to implementation.
- [**zod**](https://github.com/colinhacks/zod) ([Colin McDonnell](https://colinhacks.com/))
  Inspired the design of `ask` and `safeAsk` variants for error throwing and non-throwing APIs.
