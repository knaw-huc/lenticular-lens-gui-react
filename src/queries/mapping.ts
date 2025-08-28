import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {api} from 'utils/config.ts';
import {Job} from 'utils/interfaces.ts';

const getMappingQueryOptions = (mappingId: string | null) => queryOptions({
    queryKey: ['mapping', mappingId],
    staleTime: 60 * 1000 * 15, // 15 minutes
    queryFn: _ => loadMapping(mappingId!),
    enabled: !!mappingId,
});

export function useMapping(mappingId: string | null) {
    return useSuspenseQuery(getMappingQueryOptions(mappingId));
}

export function resetMapping(queryClient: QueryClient, mappingId: string) {
    queryClient.invalidateQueries(getMappingQueryOptions(mappingId));
}

export async function prefetchMappingsForJob(queryClient: QueryClient, job: Job) {
    return Promise.all(job.entity_type_selections
        .map(ets => ets.dataset?.mapping?.url || ets.dataset?.mapping?.file?.id)
        .filter(mappingId => mappingId !== undefined)
        .filter((mappingId, idx, mappingIds) => mappingIds.findIndex(mappingId2 => mappingId2 === mappingId) === idx)
        .map(mappingId => queryClient.prefetchQuery(getMappingQueryOptions(mappingId))));
}

export async function addMapping(url?: string, file?: File): Promise<string> {
    const body = new FormData();
    body.append('type', 'jsonld');

    if (url)
        body.append('url', url);
    else if (file)
        body.append('file', file);

    const response = await fetch(`${api}/mappings`, {
        method: 'POST',
        body
    });

    if (!response.ok)
        throw new Error('Unable to create new mapping!');

    const result = await response.json();

    return result.mapping_id;
}

async function loadMapping(mappingId: string): Promise<{ [uri: string]: string }> {
    const response = await fetch(`${api}/mappings/${mappingId}`);
    if (!response.ok)
        throw new Error(`Unable to fetch mapping for id ${mappingId}!`);

    return response.json();
}
