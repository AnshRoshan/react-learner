import { useSyncExternalStore, type AnchorHTMLAttributes } from "react";

/**
 * A tiny hash router.
 *
 * `useSyncExternalStore` is React's official way to read state that lives
 * *outside* React (here: window.location.hash) and re-render when it changes.
 */
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

const getSnapshot = () => window.location.hash.slice(1) || "/";

export function usePath() {
  return useSyncExternalStore(subscribe, getSnapshot, () => "/");
}

export function navigate(to: string) {
  window.location.hash = to;
}

type LinkProps = { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Link({ to, ...rest }: LinkProps) {
  return <a href={`#${to}`} {...rest} />;
}
