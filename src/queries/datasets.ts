import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {Dataset, Job} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const getDatasetsQueryOptions = (graphqlEndpoint: string) => queryOptions({
    queryKey: ['datasets', graphqlEndpoint],
    staleTime: 60 * 1000 * 5, // 5 minutes
    queryFn: _ => loadDatasets(graphqlEndpoint)
});

export function useDatasets(graphqlEndpoint: string) {
    return useSuspenseQuery(getDatasetsQueryOptions(graphqlEndpoint));
}

export async function prefetchDatasetsForJob(queryClient: QueryClient, job: Job) {
    return Promise.all(job.entity_type_selections
        .map(ets => ets.dataset.timbuctoo_graphql)
        .filter((endpoint, idx, endpoints) => endpoints.findIndex(endpoint2 => endpoint2 === endpoint) === idx)
        .map(graphqlEndpoint => queryClient.prefetchQuery(getDatasetsQueryOptions(graphqlEndpoint))));
}

async function loadDatasets(graphqlEndpoint: string): Promise<{ [id: string]: Dataset }> {
    const response = await fetch(`${api}/datasets?endpoint=${graphqlEndpoint}`);
    if (!response.ok)
        throw new Error(`Unable to fetch datasets from GraphQL endpoint ${graphqlEndpoint}!`);

    return response.json();
}
