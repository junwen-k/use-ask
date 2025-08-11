import { useLocation } from 'preact-iso';

export function Header() {
  const { url } = useLocation();

  return (
    <header>
      <nav>
        <a href="/hooks" class={url == '/hooks' && 'active'}>
          Hooks
        </a>
        <a href="/signals" class={url == '/signals' && 'active'}>
          Signals
        </a>
      </nav>
    </header>
  );
}
