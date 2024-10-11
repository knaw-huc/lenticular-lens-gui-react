import {useContext, useEffect, useRef} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {createFileRoute, Outlet} from '@tanstack/react-router';
import {EntityTypeSelectionsProvider} from 'context/EntityTypeSelectionsContext.tsx';
import {LinksetSpecsContextProvider} from 'context/LinksetSpecsContext.tsx';
import {LensSpecsContextProvider} from 'context/LensSpecsContext.tsx';
import {ViewsContextProvider} from 'context/ViewsContext.tsx';
import {RootContext} from 'context/RootContext.tsx';
import {FilteredClustersContextProvider} from 'context/FilteredClustersContext.tsx';
import {prefetchJob, useJob} from 'queries/job.ts';
import {prefetchLinksets} from 'queries/linksets.ts';
import {prefetchLenses} from 'queries/lenses.ts';
import {prefetchClusterings} from 'queries/clusterings.ts';
import {prefetchDatasetsForJob} from 'queries/datasets.ts';
import {setUpJobSocket} from 'queries/socket.ts';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import useViews from 'hooks/useViews.ts';
import QueryStateBoundary from 'components/QuerySateBoudary.tsx';
import {UnsavedData} from 'utils/interfaces.ts';

function Job() {
    const queryClient = useQueryClient();
    const {jobId} = Route.useParams();
    const {data: job} = useJob(jobId);
    const {setLastActiveJob} = useContext(RootContext);

    useEffect(() => {
        setLastActiveJob(job);
    }, [job]);

    useEffect(() => {
        prefetchLinksets(queryClient, jobId);
        prefetchLenses(queryClient, jobId);
        prefetchClusterings(queryClient, jobId);
    }, [queryClient, jobId]);

    useEffect(() => {
        prefetchDatasetsForJob(queryClient, job);
    }, [queryClient, job]);

    return (
        <EntityTypeSelectionsProvider initialEntityTypeSelections={job.entity_type_selections}>
            <LinksetSpecsContextProvider initialLinksetSpecs={job.linkset_specs}>
                <LensSpecsContextProvider initialLensSpecs={job.lens_specs}>
                    <ViewsContextProvider initialViews={job.views}>
                        <FilteredClustersContextProvider>
                            <JobSocket/>
                        </FilteredClustersContextProvider>
                    </ViewsContextProvider>
                </LensSpecsContextProvider>
            </LinksetSpecsContextProvider>
        </EntityTypeSelectionsProvider>
    );
}

function JobSocket() {
    const queryClient = useQueryClient();
    const {jobId} = Route.useParams();
    const {entityTypeSelections, updateEntityTypeSelections} = useEntityTypeSelections();
    const {linksetSpecs, updateLinksetSpecs} = useLinksetSpecs();
    const {lensSpecs, updateLensSpecs} = useLensSpecs();
    const {views, updateViews} = useViews();
    const unsavedData = useRef({entityTypeSelections, linksetSpecs, lensSpecs, views});

    function getUnsavedData() {
        return unsavedData.current;
    }

    function updateUnsavedData(unsavedData: UnsavedData) {
        updateEntityTypeSelections(unsavedData.entityTypeSelections);
        updateLinksetSpecs(unsavedData.linksetSpecs);
        updateLensSpecs(unsavedData.lensSpecs);
        updateViews(unsavedData.views);
    }

    useEffect(() => {
        unsavedData.current = {entityTypeSelections, linksetSpecs, lensSpecs, views};
    }, [entityTypeSelections, linksetSpecs, lensSpecs, views]);

    useEffect(() => {
        return setUpJobSocket(queryClient, jobId, getUnsavedData, updateUnsavedData);
    }, [queryClient, jobId]);

    return (
        <QueryStateBoundary>
            <Outlet/>
        </QueryStateBoundary>
    );
}

export const Route = createFileRoute('/$jobId')({
    component: Job,
    loader: ({context: {queryClient}, params: {jobId}}) => {
        prefetchJob(queryClient, jobId);
    }
});
