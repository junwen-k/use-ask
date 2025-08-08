import 'preact/debug';

import { LocationProvider, Route, Router, hydrate, prerender as ssr } from 'preact-iso';

import { Header } from './components/Header.jsx';
import { Hooks } from './pages/hooks.js';
import { Signals } from './pages/signals';
import './style.css';

export function App() {
  return (
    <LocationProvider>
      <Header />
      <main>
        <Router>
          <Route path="/signals" component={Signals} />
          <Route default component={Hooks} />
        </Router>
      </main>
    </LocationProvider>
  );
}

if (typeof window !== 'undefined') {
  hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
