import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {Clustering} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const getClusteringsQueryOptions = (jobId: string) => queryOptions({
    queryKey: ['clusterings', jobId],
    staleTime: 60 * 1000, // 1 minute
    queryFn: _ => loadClusterings(jobId)
});

export function useClusterings(jobId: string) {
    return useSuspenseQuery(getClusteringsQueryOptions(jobId));
}

export function resetClusterings(queryClient: QueryClient, id: string) {
    queryClient.invalidateQueries(getClusteringsQueryOptions(id));
}

export async function prefetchClusterings(queryClient: QueryClient, id: string) {
    return queryClient.prefetchQuery(getClusteringsQueryOptions(id));
}

export async function runClustering(jobId: string, type: 'linkset' | 'lens', id: number): Promise<boolean> {
    const result = await fetch(`${api()}/job/${jobId}/run_clustering/${type}/${id}`, {
        method: 'POST'
    });

    return result.ok;
}

async function loadClusterings(jobId: string): Promise<Clustering[]> {
    const response = await fetch(`${api()}/job/${jobId}/clusterings`);
    if (!response.ok)
        throw new Error(`Unable to fetch clusterings for job with id ${jobId}!`);

    const clusterings = await response.json();
    for (const clustering of clusterings) {
        clustering.requested_at = clustering.requested_at ? new Date(clustering.requested_at) : null;
        clustering.processing_at = clustering.processing_at ? new Date(clustering.processing_at) : null;
        clustering.finished_at = clustering.finished_at ? new Date(clustering.finished_at) : null;
    }

    return clusterings;
}
