![@ui-call's Logo](../../docs/@ui-call.svg)

# @ui-call/core

A lightweight, framework-agnostic promise-based call store that elegantly manages asynchronous user interactions across any UI library.

Call UI components imperatively, just like `window.confirm()`, but with full control over the UI implementation:

<table>
<tr>
<td><strong>Browser API</strong></td>
<td><strong>@ui-call/core</strong></td>
</tr>
<tr>
<td>

```ts
const confirmed = window.confirm('Are you sure?');
if (confirmed) {
  deleteItem(); // 🗑️
}
```

</td>
<td>

```ts
const confirmed = await store.call('Are you sure?');
if (confirmed) {
  deleteItem(); // 🗑️
}
```

</td>
</tr>
</table>

## ✨ Key Features

- 🎯 **Universal Compatibility** - Seamlessly integrates with any JavaScript UI library through a simple observable pattern
- 📡 **Imperative API** - Present any UI component and await user responses with natural async/await syntax
- 📚 **Stackable Interactions** - Handle multiple concurrent UI calls
- 🛠️ **Type-safe** - First-class TypeScript support
- 🌐 **Idiomatic API** - Thoughtfully designed to follow familiar browser patterns and conventions

## 📦 Installation

```bash
npm install @ui-call/core
```

> [!NOTE]
> We provide dedicated reactivity binding packages for popular libraries (React, Vue, Svelte, etc.). Unless you're building a custom integration, we recommend using a framework-specific binding package instead of the core directly.

## 🧠 Core Concepts

### `CallStore`

Manages a **stack** of concurrent UI calls, perfect for toasts, snackbars, notifications, or any transient UI elements that can coexist.

```ts
import { CallStore } from '@ui-call/core';

const store = new CallStore<{ message: string }, string, string>();

const result = await store.call({ message: 'Are you sure?' });

// ...

// Render all active calls in your UI
store.stack.map((call) => {
  // Your UI rendering logic here
  // call.resolve('User clicked OK');
  // call.reject('User dismissed');
});
```

### `SingletonCallStore`

Ensures only **one active call** at a time, ideal for modals, dialogs, or any blocking UI interactions.

```ts
import { SingletonCallStore } from '@ui-call/core';

const store = new SingletonCallStore<string, boolean>();

const confirmed = await store.call('Are you sure?');

// ...

// Your UI rendering logic here
const call = store.current;
// call.resolve(true);  // User confirmed
// call.resolve(false); // User cancelled
```

## 🔧 Features

### Update

Update call payloads in real-time for dynamic content:

```ts
// Method 1: Using the call object directly from stack
store.stack.forEach((call) => {
  call.update({ message: '...' });
});

// Method 2: Using the promise reference
const promise = store.call({ message: 'Processing...' });
store.update(promise, { message: 'Complete!' });
```

### Event Subscriptions

Subscribe to call lifecycle events for reactive UI updates:

```ts
store.addEventListener('add', (event) => {
  console.log('New call started:', event.call);
});

store.addEventListener('update', (event) => {
  console.log('Call updated:', event.call);
});

store.addEventListener('resolve', (event) => {
  console.log('Call resolved:', event.call);
});

store.addEventListener('reject', (event) => {
  console.log('Call rejected:', event.call);
});

store.addEventListener('settled', (event) => {
  console.log('Call completed:', event.call);
});
```

### Exit Animations

Configure unmounting delays to match your exit animation durations:

```ts
const store = new CallStore<{ message: string }, string, string>({
  unmountingDelay: 1000,
});
```

Use the `call.pending` boolean to apply your enter/exit animation classes.

## Acknowledgments

This library is the successor to my original [use-ask](https://github.com/junwen-k/use-ask) library, heavily inspired by the elegant design of [react-call](https://github.com/desko27/react-call) by [@desko27](https://github.com/desko27).
