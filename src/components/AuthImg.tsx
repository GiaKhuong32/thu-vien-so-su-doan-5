import { useAuthorizedUrl } from '../hooks/useAuthorizedUrl';

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

// <img> cannot send Authorization headers; this resolves API-hosted
// images through an authenticated fetch into a blob URL.
export default function AuthImg({ src, alt = '', className }: Props) {
  const resolved = useAuthorizedUrl(src);
  if (!resolved) return null;
  return <img src={resolved} alt={alt} className={className} loading="lazy" />;
}
