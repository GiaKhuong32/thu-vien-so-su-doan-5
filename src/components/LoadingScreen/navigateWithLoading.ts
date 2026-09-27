type GoFn = (href: string) => void;

let go: GoFn | null = null;

export function registerNavigateWithLoading(fn: GoFn) {
  go = fn;
  return () => {
    go = null;
  };
}

export function navigateWithLoading(href: string) {
  if (go) {
    go(href);
    return;
  }
  window.location.assign(href);
}
