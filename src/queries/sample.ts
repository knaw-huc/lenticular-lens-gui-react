import {useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery} from '@tanstack/react-query';
import {Sample} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const pageSize = 50;

export function useSamples(jobId: string, etsId: number, invert: boolean = false) {
    return useSuspenseInfiniteQuery({
        queryKey: ['samples', jobId, etsId, invert],
        initialPageParam: 0,
        getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
        queryFn: async ({pageParam}) => loadSamples(jobId, etsId, invert, pageParam)
    });
}

export function useSampleTotal(jobId: string, etsId: number) {
    return useSuspenseQuery({
        queryKey: ['sample_total', jobId, etsId],
        queryFn: async () => loadSampleTotal(jobId, etsId)
    });
}

export function useResetSamples(jobId: string, etsId: number, invert: boolean = false) {
    const queryClient = useQueryClient();
    const resetSamples = () => {
        queryClient.invalidateQueries({queryKey: ['samples', jobId, etsId, invert]});
        queryClient.invalidateQueries({queryKey: ['sample_total', jobId, etsId]});
    };
    return {resetSamples};
}

async function loadSamples(jobId: string, etsId: number, invert: boolean, page: number): Promise<Sample[]> {
    const params = new URLSearchParams({
        invert: invert.toString(),
        limit: pageSize.toString(),
        offset: (pageSize * page).toString()
    });

    const response = await fetch(`${api()}/job/${jobId}/entity_type_selection/${etsId}?${params.toString()}`);
    if (!response.ok)
        throw new Error('Unable to fetch samples!');

    const results = await response.json();
    return results.map((sample: Sample, idx: number) => ({
        ...sample,
        count: (pageSize * page) + idx + 1
    }));
}

async function loadSampleTotal(jobId: string, etsId: number): Promise<number> {
    const response = await fetch(`${api()}/job/${jobId}/entity_type_selection_total/${etsId}`);
    if (!response.ok)
        throw new Error('Unable to fetch sample total!');

    return (await response.json()).total;
}
