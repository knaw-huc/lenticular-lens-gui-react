import {createRootRouteWithContext, Link, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {prefetchMethods} from 'queries/methods.ts';
import {prefetchDownloadsSPARQL} from 'queries/downloads_sparql.ts';
import {prefetchDownloadsTimbuctoo} from 'queries/downloads_timbuctoo.ts';
import {setUpSocket} from 'queries/socket.ts';
import useActiveJob from 'stores/useActiveJob.ts';
import QueryStateBoundary from 'components/QuerySateBoudary.tsx';
import {UserInfo} from 'utils/interfaces.ts';
import {api, isProd} from 'utils/config.ts';
import logo from 'assets/logo-ga.png';
import classes from './root.module.css';

function App() {
    return (
        <>
            <Header/>
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

function Header() {
    return (
        <header className={classes.header}>
            <div className={classes.logo}>
                <img src={logo} alt="logo"></img>
            </div>

            <Link to="/" className={classes.title}>
                Lenticular Lens
            </Link>

            <HeaderJobNavigation/>
        </header>
    );
}

function HeaderJobNavigation() {
    const job = useActiveJob(state => state.job);
    if (!job)
        return;

    return (
        <>
            <Link to="/$jobId"
                  params={{jobId: job.id}}
                  activeProps={{className: classes.selected}}
                  className={classes.jobTitle}>
                {job.title}
            </Link>

            <nav>
                <Link to="/$jobId/data-selection"
                      params={{jobId: job.id}}
                      activeProps={{className: classes.selected}}>
                    Data Selection
                </Link>

                <Link to="/$jobId/alignment"
                      params={{jobId: job.id}}
                      activeProps={{className: classes.selected}}>
                    Alignment
                </Link>

                <Link to="/$jobId/lens"
                      params={{jobId: job.id}}
                      activeProps={{className: classes.selected}}>
                    Apply lens
                </Link>
            </nav>
        </>
    );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: App,
    beforeLoad: async () => {
        function getAuthFromSession(): [boolean, UserInfo | null] {
            const isAuthEnabled = sessionStorage.getItem('ll_isAuthEnabled') !== null
                ? sessionStorage.getItem('ll_isAuthEnabled') === 'true' : true;
            const userInfo: UserInfo | null = sessionStorage.getItem('ll_userInfo') !== null
                ? JSON.parse(sessionStorage.getItem('ll_userInfo')!) : null;

            return [isAuthEnabled, userInfo];
        }

        const [isAuthEnabled, userInfo] = getAuthFromSession();
        if (isAuthEnabled && !userInfo) {
            const response = await fetch(`${api}/userinfo`);
            const updatedUserInfo: UserInfo | null = response.ok ? await response.json() : null;
            const updatedIsAuthEnabled = response.ok || response.status !== 404;

            sessionStorage.setItem('ll_userInfo', JSON.stringify(updatedUserInfo));
            sessionStorage.setItem('ll_isAuthEnabled', updatedIsAuthEnabled.toString());
        }

        const [isAuthStillEnabled, refreshedUserInfo] = getAuthFromSession();
        if (isAuthStillEnabled && !refreshedUserInfo)
            window.location.replace(`${api}/login?redirect=` + encodeURIComponent(window.location.href));
    },
    loader: ({context: {queryClient}}) => {
        prefetchMethods(queryClient);
        prefetchDownloadsSPARQL(queryClient);
        prefetchDownloadsTimbuctoo(queryClient);
    },
    onEnter: ({context: {queryClient}}) => {
        const socket = setUpSocket(queryClient);
        useActiveJob.getState().setGlobal(socket);
    },
    onLeave: () => {
        useActiveJob.getState().leaveGlobal();
    }
});
