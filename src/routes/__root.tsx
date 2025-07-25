import {useContext, useEffect} from 'react';
import {createRootRouteWithContext, Link, Outlet, useMatches} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/router-devtools';
import {useQueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {RootContext} from 'context/RootContext.tsx';
import {prefetchMethods} from 'queries/methods.ts';
import {prefetchDownloadsSPARQL} from 'queries/downloads_sparql.ts';
import {prefetchDownloadsTimbuctoo} from 'queries/downloads_timbuctoo.ts';
import {setUpSocket} from 'queries/socket.ts';
import QueryStateBoundary from 'components/QuerySateBoudary.tsx';
import {BasicJobMetadata, RouterContext} from 'utils/interfaces.ts';
import {api, isProd} from 'utils/config.ts';
import logo from 'assets/logo-ga.png';
import classes from './root.module.css';

function App() {
    const queryClient = useQueryClient();
    const {lastActiveJob, setLastActiveJob} = useContext(RootContext);
    const jobMatch = useMatches({select: matches => matches.find(match => match.routeId === '/$jobId')});

    useEffect(() => {
        if (!jobMatch)
            setLastActiveJob(null);
    }, [jobMatch]);

    useEffect(() => setUpSocket(queryClient), [queryClient]);

    return (
        <>
            <Header logo={logo} lastActiveJob={lastActiveJob}/>
            <main className={classes.main}>
                <QueryStateBoundary>
                    <Outlet/>
                </QueryStateBoundary>

                {!isProd && <ReactQueryDevtools buttonPosition="bottom-left"/>}
                {!isProd && <TanStackRouterDevtools position="bottom-right"/>}
            </main>
        </>
    );
}

function Header({logo, lastActiveJob}: { logo: string, lastActiveJob: BasicJobMetadata | null }) {
    return (
        <header className={classes.header}>
            <div className={classes.logo}>
                <img src={logo} alt="logo"></img>
            </div>

            <Link to="/" className={classes.title}>
                Lenticular Lens
            </Link>

            {lastActiveJob && <>
                <Link to="/$jobId"
                      params={{jobId: lastActiveJob.id}}
                      activeProps={{className: classes.selected}}
                      className={classes.jobTitle}>
                    {lastActiveJob.title}
                </Link>

                <nav>
                    <Link to="/$jobId/data-selection"
                          params={{jobId: lastActiveJob.id}}
                          activeProps={{className: classes.selected}}>
                        Data Selection
                    </Link>

                    <Link to="/$jobId/alignment"
                          params={{jobId: lastActiveJob.id}}
                          activeProps={{className: classes.selected}}>
                        Alignment
                    </Link>

                    <Link to="/$jobId/lens"
                          params={{jobId: lastActiveJob.id}}
                          activeProps={{className: classes.selected}}>
                        Apply lens
                    </Link>
                </nav>
            </>}
        </header>
    );
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: App,
    beforeLoad: async ({context}) => context.authenticate((userInfo, isAuthEnabled) => {
        if (isAuthEnabled && !userInfo)
            window.location.replace(`${api}/login?redirect-uri=` + encodeURIComponent(window.location.href));
    }),
    loader: ({context: {queryClient}}) => {
        prefetchMethods(queryClient);
        prefetchDownloadsSPARQL(queryClient);
        prefetchDownloadsTimbuctoo(queryClient);
    }
});
