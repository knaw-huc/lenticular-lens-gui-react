import {QueryClient} from '@tanstack/react-query';
import {createFileRoute, Outlet} from '@tanstack/react-router';
import {fetchJob, prefetchJob} from 'queries/job.ts';
import {prefetchLinksets} from 'queries/linksets.ts';
import {prefetchLenses} from 'queries/lenses.ts';
import {prefetchClusterings} from 'queries/clusterings.ts';
import {prefetchDatasetsTimbuctooForJob} from 'queries/datasets_timbuctoo.ts';
import {prefetchDatasetsSPARQLForJob} from 'queries/datasets_sparql.ts';
import {setUpJobSocket} from 'queries/socket.ts';
import useActiveJob from 'stores/useActiveJob.ts';
import useEntityTypeSelections from 'stores/useEntityTypeSelections.ts';
import useLinksetSpecs from 'stores/useLinksetSpecs.ts';
import useLensSpecs from 'stores/useLensSpecs.ts';
import useViews from 'stores/useViews.ts';
import {Spinner} from 'utils/components.tsx';
import QueryStateBoundary from 'components/QuerySateBoudary.tsx';

function Job() {
    const {jobId} = Route.useParams();
    const activeJob = useActiveJob((state) => state.job);

    return (
        <QueryStateBoundary>
            {activeJob?.id !== jobId ? <Spinner/> : <Outlet/>}
        </QueryStateBoundary>
    );
}

async function loadJobState(queryClient: QueryClient, jobId: string) {
    const job = await fetchJob(queryClient, jobId);

    prefetchLinksets(queryClient, jobId);
    prefetchLenses(queryClient, jobId);
    prefetchClusterings(queryClient, jobId);

    prefetchDatasetsTimbuctooForJob(queryClient, job);
    prefetchDatasetsSPARQLForJob(queryClient, job);

    const socket = setUpJobSocket(queryClient, jobId);
    useActiveJob.getState().setJob(job, socket);

    useEntityTypeSelections.getState().updateEntityTypeSelections(job.entity_type_selections);
    useLinksetSpecs.getState().updateLinksetSpecs(job.linkset_specs);
    useLensSpecs.getState().updateLensSpecs(job.lens_specs);
    useViews.getState().updateViews(job.views);
}

export const Route = createFileRoute('/$jobId')({
    component: Job,
    loader: ({context: {queryClient}, params: {jobId}}) => {
        prefetchJob(queryClient, jobId);
    },
    onEnter: async ({context: {queryClient}, params: {jobId}}) => {
        loadJobState(queryClient, jobId);
    },
    onStay: async ({context: {queryClient}, params: {jobId}}) => {
        if (jobId !== useActiveJob.getState().job?.id) {
            useActiveJob.getState().leaveJob();
            loadJobState(queryClient, jobId);
        }
    },
    onLeave: () => {
        useActiveJob.getState().leaveJob();
    }
});
