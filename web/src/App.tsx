import { useEffect } from 'react';
import { Access } from './components/Access';
import { Grouping } from './components/Grouping';
import { Pin } from './components/Marks';
import { ReportEditor } from './components/ReportEditor';
import { Reports } from './components/Reports';
import { Schedule } from './components/Schedule';
import { Shell } from './components/Shell';
import { canEdit, isLead, reload, useStore } from './data/store';
import { useRoute } from './router';

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <article className="sheet notice">
        <Pin className="pin-l" />
        <Pin className="pin-r" />
        <h1 className="sheet-title">{title}</h1>
        <p className="sheet-sub">{children}</p>
      </article>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const s = useStore();
  useEffect(() => {
    void reload();
  }, []);

  let page;
  if (s.status === 'loading') page = <Notice title="Loading">Getting the schedule…</Notice>;
  else if (s.status === 'error')
    page = (
      <Notice title="Can’t load the schedule">
        {s.error} <button type="button" className="btn-quiet" onClick={() => void reload()}>Try again</button>
      </Notice>
    );
  else if (route.name === 'schedule') page = <Schedule date={route.date} />;
  else if (!canEdit(s)) page = <Notice title="Sign in to see this">Grouping and reports are for the ministry lead and SICs. <a href="#/">Back to the schedule</a></Notice>;
  else if (route.name === 'grouping') page = <Grouping />;
  else if (route.name === 'reports') page = <Reports />;
  else if (route.name === 'report') page = <ReportEditor key={route.id} id={route.id} />;
  else if (route.name === 'new-report') page = <ReportEditor key={`${route.date}-${route.service}`} date={route.date} service={route.service} />;
  else if (!isLead(s)) page = <Notice title="Lead only">Only the ministry lead can manage who signs in.</Notice>;
  else page = <Access />;

  return <Shell route={route}>{page}</Shell>;
}
