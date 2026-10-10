import { useEffect, useState } from 'react';

import { getAuthHeaders, getToken } from '../api/client';
import { API_BASE_URL } from '../config/api';

function isApiFileUrl(url: string): boolean {
  return url.startsWith(API_BASE_URL) || url.startsWith('/files/');
}

// Media elements (<img>, <audio>, <video>) cannot send Authorization headers,
// so API-hosted files are fetched with the token and exposed as blob URLs.
// Non-API URLs (and anonymous browsing) pass through unchanged.
export function useAuthorizedUrl(url: string | null | undefined): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const needsAuth = Boolean(url && getToken() && isApiFileUrl(url));

  useEffect(() => {
    if (!url || !needsAuth) {
      setObjectUrl(null);
      return;
    }

    let cancelled = false;
    let created: string | null = null;

    fetch(url, { headers: getAuthHeaders() })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Không tải được tệp (${response.status})`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch(() => {
        if (!cancelled) setObjectUrl(null);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [url, needsAuth]);

  if (!url) return null;
  return needsAuth ? objectUrl : url;
}
