import {Suspense} from 'react';
import {createFileRoute, notFound} from '@tanstack/react-router';
import Tabs from 'components/Tabs.tsx';
import Info from 'components/shared/Info.tsx';
import DatasetSelection from 'components/data-selection/DatasetSelection.tsx';
import Filter from 'components/data-selection/Filter.tsx';
import Sample from 'components/data-selection/Sample.tsx';
import EntityTypeSelectionMenu from 'components/data-selection/EntityTypeSelectionMenu.tsx';
import useEntityTypeSelections from 'stores/useEntityTypeSelections.ts';
import useLinksetSpecs from 'stores/useLinksetSpecs.ts';
import {fetchJob, useJob} from 'queries/job.ts';
import {useLinksets} from 'queries/linksets.ts';
import {DataSetIcon} from 'utils/icons.tsx';
import {EntityTypeSelection} from 'utils/interfaces.ts';
import {Container, MainTypeHeader} from 'utils/components.tsx';
import {isEntityTypeUsedInLinkset} from 'utils/specifications.ts';

function DataSelection() {
    const {jobId, id} = Route.useParams();

    const {data: job} = useJob(jobId);
    const entityTypeSelections = useEntityTypeSelections(state => state.entityTypeSelections);
    const linksetSpecs = useLinksetSpecs(state => state.linksetSpecs);
    const {data: linksets} = useLinksets(jobId);

    const ets = entityTypeSelections.find(ets => ets.id === parseInt(id))!;
    const persistedEts = job.entity_type_selections.find(ets => ets.id === parseInt(id));

    const hasDataset = ets.dataset?.entity_type_id;
    const hasPersistedDataset = persistedEts?.dataset?.entity_type_id;

    const isInUse = isEntityTypeUsedInLinkset(ets.id, linksetSpecs, linksets);

    return (
        <>
            <MainTypeHeader menu={<Suspense><EntityTypeSelectionMenu jobId={jobId}/></Suspense>}>
                <DataSetIcon/>
                {ets.label}
            </MainTypeHeader>

            <Container>
                <Tabs tabs={{
                    'info': {
                        title: 'Info',
                        content: <EntityTypeSelectionInfo ets={ets}/>
                    },
                    'dataset': {
                        title: 'Dataset',
                        content: <DatasetSelection ets={ets} isInUse={isInUse}/>
                    },
                    'filter': {
                        title: 'Filter',
                        content: <Filter ets={ets} isInUse={isInUse}/>,
                        disabled: !hasDataset
                    },
                    'sample': {
                        title: 'Sample',
                        content: <Sample jobId={jobId} ets={ets}/>,
                        disabled: !hasPersistedDataset
                    }
                }}/>
            </Container>
        </>
    );
}

function EntityTypeSelectionInfo({ets}: { ets: EntityTypeSelection }) {
    const update = useEntityTypeSelections(state => state.update);

    return (
        <Info metadata={ets} withUpdate={metadata => update(ets.id, ets => Object.assign(ets, metadata))}/>
    );
}

export const Route = createFileRoute('/$jobId/data-selection/$id')({
    component: DataSelection,
    loader: async ({context: {queryClient}, params: {jobId, id}}) => {
        const job = await fetchJob(queryClient, jobId);
        const ets = job.entity_type_selections.find(spec => spec.id === parseInt(id));
        if (ets === undefined)
            throw notFound();
    }
});
