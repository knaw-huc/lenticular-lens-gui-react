import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {
    Job,
    DatasetRef,
    EntityType,
    TimbuctooDataset,
    TimbuctooDatasetRef,
    TimbuctooStatusUpdate
} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const getDatasetsTimbuctooQueryOptions = (graphqlEndpoint: string) => queryOptions({
    queryKey: ['datasets', 'timbuctoo', graphqlEndpoint],
    staleTime: 60 * 1000 * 5, // 5 minutes
    queryFn: _ => loadDatasetsTimbuctoo(graphqlEndpoint)
});

export function datasetRefIsTimbuctoo(datasetRef: DatasetRef | null): datasetRef is TimbuctooDatasetRef {
    return datasetRef?.type === 'timbuctoo';
}

export function useDatasetsTimbuctoo(graphqlEndpoint: string) {
    return useSuspenseQuery(getDatasetsTimbuctooQueryOptions(graphqlEndpoint));
}

export async function prefetchDatasetsTimbuctooForJob(queryClient: QueryClient, job: Job) {
    return Promise.all(job.entity_type_selections
        .map(ets => datasetRefIsTimbuctoo(ets.dataset) ? ets.dataset.graphql_endpoint : undefined)
        .filter(endpoint => endpoint !== undefined)
        .filter((endpoint, idx, endpoints) => endpoints.findIndex(endpoint2 => endpoint2 === endpoint) === idx)
        .map(graphqlEndpoint => queryClient.prefetchQuery(getDatasetsTimbuctooQueryOptions(graphqlEndpoint))));
}

export function updateEntitiesTimbuctoo(queryClient: QueryClient, timbuctooStatusUpdate: TimbuctooStatusUpdate) {
    queryClient.setQueryData(['datasets', 'timbuctoo', timbuctooStatusUpdate.graphql_endpoint], (old: {
        [id: string]: TimbuctooDataset
    }) => {
        if (!old)
            return undefined;

        const newDatasets = {...old};
        newDatasets[timbuctooStatusUpdate.timbuctoo_id] = {
            ...newDatasets[timbuctooStatusUpdate.timbuctoo_id],
            entity_types: {
                ...newDatasets[timbuctooStatusUpdate.timbuctoo_id].entity_types,
                [timbuctooStatusUpdate.entity_type_id]: {
                    ...newDatasets[timbuctooStatusUpdate.timbuctoo_id].entity_types[timbuctooStatusUpdate.entity_type_id],
                    status: timbuctooStatusUpdate.status,
                } as EntityType
            }
        };

        return newDatasets;
    });
}

async function loadDatasetsTimbuctoo(graphqlEndpoint: string): Promise<{ [id: string]: TimbuctooDataset }> {
    if (!graphqlEndpoint)
        return {};

    const response = await fetch(`${api}/datasets/timbuctoo?graphql_endpoint=${graphqlEndpoint}`);
    if (!response.ok)
        throw new Error(`Unable to fetch datasets from GraphQL endpoint ${graphqlEndpoint}!`);

    return response.json();
}
