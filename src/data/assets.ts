const bookImages = import.meta.glob('../assets/books/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const skinImages = import.meta.glob('../assets/skin/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const assetImages = import.meta.glob('../assets/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function bookImage(fileName: string) {
  return bookImages[`../assets/books/${fileName}`] || '';
}

export function skinImage(fileName: string) {
  return skinImages[`../assets/skin/${fileName}`] || '';
}

export function assetImage(path: string) {
  return assetImages[`../assets/${path}`] || '';
}
