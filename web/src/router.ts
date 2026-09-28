import { useEffect, useState } from 'react';

export type Route =
  | { name: 'schedule'; date?: string }
  | { name: 'grouping' }
  | { name: 'access' }
  | { name: 'reports' }
  | { name: 'report'; id: string }
  | { name: 'new-report'; date?: string; service?: string };

function parse(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const q = new URLSearchParams(query);
  const parts = path.split('/').filter(Boolean);
  switch (parts[0]) {
    case 'grouping':
      return { name: 'grouping' };
    case 'access':
      return { name: 'access' };
    case 'reports':
      if (parts[1] === 'new') return { name: 'new-report', date: q.get('date') ?? undefined, service: q.get('service') ?? undefined };
      if (parts[1]) return { name: 'report', id: parts[1] };
      return { name: 'reports' };
    default:
      return { name: 'schedule', date: q.get('date') ?? undefined };
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const onHash = () => {
      setRoute(parse(location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export const go = (path: string) => {
  location.hash = path;
};
