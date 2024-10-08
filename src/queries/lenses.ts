import {QueryClient, queryOptions, useQuery, useSuspenseQuery} from '@tanstack/react-query';
import {Lens} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const getLensesQueryOptions = (jobId: string) => queryOptions({
    queryKey: ['lenses', jobId],
    staleTime: 60 * 1000, // 1 minute
    queryFn: _ => loadLenses(jobId)
});

export function useLenses(jobId: string) {
    return useSuspenseQuery(getLensesQueryOptions(jobId));
}

export function useLens(jobId: string, id: number) {
    const {data} = useQuery(getLensesQueryOptions(jobId));
    return data?.find(lens => lens.spec_id === id);
}

export function resetLenses(queryClient: QueryClient, id: string) {
    queryClient.invalidateQueries(getLensesQueryOptions(id));
}

export async function prefetchLenses(queryClient: QueryClient, id: string) {
    return queryClient.prefetchQuery(getLensesQueryOptions(id));
}

export async function runLens(jobId: string, id: number, restart: boolean): Promise<'ok' | 'exists' | 'error'> {
    const body = new FormData();
    body.append('restart', restart.toString());

    const result = await fetch(`${api()}/job/${jobId}/run/lens/${id}`, {
        method: 'POST',
        body
    });

    if (result.ok)
        return 'ok';

    if (result.status === 400 && (await result.json()).result === 'exists')
        return 'exists';

    return 'error';
}

async function loadLenses(jobId: string): Promise<Lens[]> {
    const response = await fetch(`${api()}/job/${jobId}/lenses`);
    if (!response.ok)
        throw new Error(`Unable to fetch lenses for job with id ${jobId}!`);

    const lenses = await response.json();
    for (const lens of lenses) {
        lens.requested_at = lens.requested_at ? new Date(lens.requested_at) : null;
        lens.processing_at = lens.processing_at ? new Date(lens.processing_at) : null;
        lens.finished_at = lens.finished_at ? new Date(lens.finished_at) : null;
    }

    return lenses;
}
