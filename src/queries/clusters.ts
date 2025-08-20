import {useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery} from '@tanstack/react-query';
import {Cluster, ClusterGraph, ClustersTotals} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

interface ClustersTotalsProperties {
    minSize?: number;
    maxSize?: number;
    minCount?: number;
    maxCount?: number;
}

export interface ClustersProperties extends ClustersTotalsProperties {
    sort?: 'size_asc' | 'size_desc' | 'count_asc' | 'count_desc';
}

interface ClusterIds {
    clusterIds: number[];
}

type ClustersTotalsProps = ClustersTotalsProperties & ClusterIds;
type ClustersProps = ClustersProperties & ClusterIds;

const pageSize = 5;

export async function runClustering(jobId: string, type: 'linkset' | 'lens', id: number): Promise<boolean> {
    const result = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters/run`, {
        method: 'POST'
    });

    return result.ok;
}

export function useClusters(jobId: string, type: 'linkset' | 'lens', id: number, props: ClustersProps) {
    return useSuspenseInfiniteQuery({
        queryKey: ['clusters', jobId, type, id, props],
        initialPageParam: 0,
        getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
        queryFn: async ({pageParam}) => loadClusters(jobId, type, id, pageParam, props)
    });
}

export function useClustersTotals(jobId: string, type: 'linkset' | 'lens', id: number,
                                  props: ClustersProps, applyFilters: boolean = false) {
    return useSuspenseQuery({
        queryKey: ['clusters_totals', jobId, type, id, props, applyFilters],
        queryFn: async () => loadClustersTotals(jobId, type, id, props, applyFilters)
    });
}

export function useClusterGraph(jobId: string, type: 'linkset' | 'lens', id: number, graphId: number) {
    return useSuspenseQuery({
        queryKey: ['clusters_graph', jobId, type, id, graphId],
        queryFn: async () => loadClusterGraph(jobId, type, id, graphId)
    });
}

export function useResetClusters(jobId: string, type: 'linkset' | 'lens', id: number, props: ClustersProps) {
    const queryClient = useQueryClient();
    const resetClusters = () => {
        queryClient.invalidateQueries({queryKey: ['clusters', jobId, type, id, props]});
        queryClient.invalidateQueries({queryKey: ['clusters_totals', jobId, type, id, props]});
    };
    return {resetClusters};
}

async function loadClusters(jobId: string, type: 'linkset' | 'lens', id: number, page: number, props: ClustersProps): Promise<Cluster[]> {
    const fetchWithProps = fetch(`${api}/job/${jobId}/${type}/${id}/clusters`, {
        method: 'POST',
        body: createClustersFormData(props, false, 'multiple', page)
    });

    const fetchWithFiltering = fetch(`${api}/job/${jobId}/${type}/${id}/clusters`, {
        method: 'POST',
        body: createClustersFormData(props, true, 'none', page)
    });

    const [responseWithProps, responseWithFiltering] = await Promise.all([fetchWithProps, fetchWithFiltering]);
    if (!responseWithProps.ok || !responseWithFiltering.ok)
        throw new Error('Unable to fetch clusters!');

    const resultsWithProps = await responseWithProps.json();
    const resultsWithFiltering = await responseWithFiltering.json();
    return resultsWithProps.map((cluster: Cluster, idx: number) => ({
        ...cluster,
        links_filtered: resultsWithFiltering.find((res: Cluster) => res.id === cluster.id)?.links || {
            accepted: 0,
            rejected: 0,
            uncertain: 0,
            unchecked: 0,
            disputed: 0
        },
        size_filtered: resultsWithFiltering.find((res: Cluster) => res.id === cluster.id)?.size || 0,
        count: (pageSize * page) + idx + 1
    }));
}

async function loadClustersTotals(jobId: string, type: 'linkset' | 'lens', id: number,
                                  props: ClustersTotalsProps, applyFilters: boolean = false): Promise<ClustersTotals> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters/totals`, {
        method: 'POST',
        body: createClustersTotalsFormData(props, applyFilters)
    });

    if (!response.ok)
        throw new Error('Unable to fetch clusters totals!');

    return response.json();
}

async function loadClusterGraph(jobId: string, type: 'linkset' | 'lens', id: number, graphId: number): Promise<ClusterGraph> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/cluster/${graphId}/graph`);
    if (!response.ok)
        throw new Error('Unable to fetch cluster graph!');

    return response.json();
}

function createClustersTotalsFormData(props: ClustersTotalsProps, applyFilters: boolean = false) {
    const data = new FormData();
    data.append('apply_filters', applyFilters.toString());

    if (applyFilters) {
        props.minSize && props.minSize > 0 && data.append('min_size', props.minSize.toString());
        props.maxSize && props.maxSize < 1 && data.append('max_size', props.maxSize.toString());

        props.minCount && props.minCount > 0 && data.append('min_count', props.minCount.toString());
        props.maxCount && props.maxCount < 1 && data.append('max_count', props.maxCount.toString());
    }

    return data;
}

function createClustersFormData(props: ClustersProps, applyFilters: boolean = false,
                                withProperties: 'none' | 'multiple' = 'multiple', page?: number) {
    const data = createClustersTotalsFormData(props, applyFilters);
    data.append('with_properties', withProperties);

    props.sort && data.append('sort', props.sort);

    if (page !== undefined) {
        data.append('limit', pageSize.toString());
        data.append('offset', (pageSize * page).toString());
    }

    return data;
}
