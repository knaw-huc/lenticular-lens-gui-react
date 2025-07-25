import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {
    Job,
    DatasetRef,
    EntityType,
    SPARQLDataset,
    SPARQLDatasetRef,
    SPARQLDatasetUpdate,
    SPARQLStatusUpdate
} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const getDatasetsSPARQLQueryOptions = (sparqlEndpoint: string) => queryOptions({
    queryKey: ['datasets', 'sparql', sparqlEndpoint],
    staleTime: 60 * 1000 * 5, // 5 minutes
    queryFn: _ => loadDatasetsSPARQL(sparqlEndpoint)
});

export function datasetRefIsSPARQL(datasetRef: DatasetRef | null): datasetRef is SPARQLDatasetRef {
    return datasetRef?.type === 'sparql';
}

export function resetDatasetsSPARQL(queryClient: QueryClient, sparqlEndpoint: string) {
    queryClient.invalidateQueries(getDatasetsSPARQLQueryOptions(sparqlEndpoint));
}

export function useDatasetsSPARQL(sparqlEndpoint: string) {
    return useSuspenseQuery(getDatasetsSPARQLQueryOptions(sparqlEndpoint));
}

export async function prefetchDatasetsSPARQLForJob(queryClient: QueryClient, job: Job) {
    return Promise.all(job.entity_type_selections
        .map(ets => datasetRefIsSPARQL(ets.dataset) ? ets.dataset.sparql_endpoint : undefined)
        .filter(endpoint => endpoint !== undefined)
        .filter((endpoint, idx, endpoints) => endpoints.findIndex(endpoint2 => endpoint2 === endpoint) === idx)
        .map(sparqlEndpoint => queryClient.prefetchQuery(getDatasetsSPARQLQueryOptions(sparqlEndpoint))));
}

export function updateDatasetsSPARQL(queryClient: QueryClient, sparqlDatasetUpdate: SPARQLDatasetUpdate) {
    if (sparqlDatasetUpdate.status === 'finished') {
        resetDatasetsSPARQL(queryClient, sparqlDatasetUpdate.sparql_endpoint);
    }
    else {
        queryClient.setQueryData(['datasets', 'sparql', sparqlDatasetUpdate.sparql_endpoint], (old: {
            [id: string]: SPARQLDataset
        }) => {
            if (!old || !(sparqlDatasetUpdate.sparql_endpoint in old))
                return undefined;

            const newDatasets = {...old};
            newDatasets[sparqlDatasetUpdate.sparql_endpoint] = {
                ...newDatasets[sparqlDatasetUpdate.sparql_endpoint],
                status: sparqlDatasetUpdate.status
            };

            return newDatasets;
        });
    }
}

export function updateEntitiesSPARQL(queryClient: QueryClient, sparqlStatusUpdate: SPARQLStatusUpdate) {
    queryClient.setQueryData(['datasets', 'sparql', sparqlStatusUpdate.sparql_endpoint], (old: {
        [id: string]: SPARQLDataset
    }) => {
        if (!old || !(sparqlStatusUpdate.sparql_endpoint in old))
            return undefined;

        const newDatasets = {...old};
        newDatasets[sparqlStatusUpdate.sparql_endpoint] = {
            ...newDatasets[sparqlStatusUpdate.sparql_endpoint],
            entity_types: {
                ...newDatasets[sparqlStatusUpdate.sparql_endpoint].entity_types,
                [sparqlStatusUpdate.entity_type_id]: {
                    ...newDatasets[sparqlStatusUpdate.sparql_endpoint].entity_types[sparqlStatusUpdate.entity_type_id],
                    status: sparqlStatusUpdate.status,
                } as EntityType
            }
        };

        return newDatasets;
    });
}

export async function runLoadSPARQL(sparqlEndpoint: string): Promise<boolean> {
    const body = new FormData();
    body.append('sparql_endpoint', sparqlEndpoint);

    const result = await fetch(`${api}/datasets/sparql/load`, {
        method: 'POST',
        body
    });

    return result.ok;
}

async function loadDatasetsSPARQL(sparqlEndpoint: string): Promise<{ [id: string]: SPARQLDataset }> {
    if (!sparqlEndpoint)
        return {};

    const response = await fetch(`${api}/datasets/sparql?sparql_endpoint=${sparqlEndpoint}`);
    if (!response.ok)
        throw new Error(`Unable to fetch downloaded SPARQL datasets from endpoint ${sparqlEndpoint}!`);

    return response.json();
}
