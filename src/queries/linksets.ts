import {QueryClient, queryOptions, useQuery, useSuspenseQuery} from '@tanstack/react-query';
import {Linkset} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const getLinksetsQueryOptions = (jobId: string) => queryOptions({
    queryKey: ['linksets', jobId],
    staleTime: 60 * 1000, // 1 minute
    queryFn: _ => loadLinksets(jobId)
});

export function useLinksets(jobId: string) {
    return useSuspenseQuery(getLinksetsQueryOptions(jobId));
}

export function useLinkset(jobId: string, id: number) {
    const {data} = useQuery(getLinksetsQueryOptions(jobId));
    return data?.find(linkset => linkset.spec_id === id);
}

export function resetLinksets(queryClient: QueryClient, id: string) {
    queryClient.invalidateQueries(getLinksetsQueryOptions(id));
}

export async function prefetchLinksets(queryClient: QueryClient, id: string) {
    return queryClient.prefetchQuery(getLinksetsQueryOptions(id));
}

export async function runLinkset(jobId: string, id: number, restart: boolean): Promise<'ok' | 'exists' | 'error'> {
    const body = new FormData();
    body.append('restart', restart.toString());

    const result = await fetch(`${api()}/job/${jobId}/run/linkset/${id}`, {
        method: 'POST',
        body
    });

    if (result.ok)
        return 'ok';

    if (result.status === 400 && (await result.json()).result === 'exists')
        return 'exists';

    return 'error';
}

async function loadLinksets(jobId: string): Promise<Linkset[]> {
    const response = await fetch(`${api()}/job/${jobId}/linksets`);
    if (!response.ok)
        throw new Error(`Unable to fetch linksets for job with id ${jobId}!`);

    const linksets = await response.json();
    for (const linkset of linksets) {
        linkset.requested_at = linkset.requested_at ? new Date(linkset.requested_at) : null;
        linkset.processing_at = linkset.processing_at ? new Date(linkset.processing_at) : null;
        linkset.finished_at = linkset.finished_at ? new Date(linkset.finished_at) : null;
    }

    return linksets;
}
