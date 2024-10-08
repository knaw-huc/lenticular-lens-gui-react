import {StrictMode, useContext} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider, createRouter} from '@tanstack/react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RootContext, RootContextProvider} from 'context/RootContext.tsx';
import {Container, Spinner} from 'utils/components.tsx';
import {routeTree} from './routeTree.gen';
import './index.css';

const queryClient = new QueryClient();
const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => <Spinner type="main"/>,
    defaultNotFoundComponent: () => <Container><h2>Not found!</h2></Container>,
    context: undefined!
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

function RouterProviderWithRootContext() {
    const context = useContext(RootContext);
    return <RouterProvider router={router} context={{queryClient, ...context}}/>;
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RootContextProvider>
            <QueryClientProvider client={queryClient}>
                <RouterProviderWithRootContext/>
            </QueryClientProvider>
        </RootContextProvider>
    </StrictMode>
);
