import {useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery} from '@tanstack/react-query';
import {
    Cluster,
    ClusterGraph,
    ClustersTotals,
    ClusterTotals,
    MinimalCluster,
    PropertyValues
} from 'utils/interfaces.ts';
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

const pageSize = 5;

export async function runClustering(jobId: string, type: 'linkset' | 'lens', id: number): Promise<boolean> {
    const result = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters/run`, {
        method: 'POST'
    });

    return result.ok;
}

export function useClusters(jobId: string, type: 'linkset' | 'lens', id: number, props: ClustersProperties) {
    return useSuspenseInfiniteQuery({
        queryKey: ['clusters', jobId, type, id, props],
        initialPageParam: 0,
        getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
        queryFn: async ({pageParam}) => loadClusters(jobId, type, id, pageParam, props)
    });
}

export function useClusterSelectionTotals(jobId: string, type: 'linkset' | 'lens', id: number, clusterIds: number[]) {
    return useSuspenseQuery({
        queryKey: ['clusters_selection_totals', jobId, type, id, clusterIds],
        queryFn: async () => loadClusterSelectionTotals(jobId, type, id, clusterIds)
    });
}

export function useClusterSelectionProps(jobId: string, type: 'linkset' | 'lens', id: number, clusterIds: number[]) {
    return useSuspenseQuery({
        queryKey: ['clusters_selection_props', jobId, type, id, clusterIds],
        queryFn: async () => loadClusterSelectionProps(jobId, type, id, clusterIds)
    });
}

export function useClustersTotals(jobId: string, type: 'linkset' | 'lens', id: number, props?: ClustersProperties) {
    return useSuspenseQuery({
        queryKey: ['clusters_totals', jobId, type, id, props],
        queryFn: async () => loadClustersTotals(jobId, type, id, props)
    });
}

export function useClusterGraph(jobId: string, type: 'linkset' | 'lens', id: number, graphId: number) {
    return useSuspenseQuery({
        queryKey: ['clusters_graph', jobId, type, id, graphId],
        queryFn: async () => loadClusterGraph(jobId, type, id, graphId)
    });
}

export function useResetClusters(jobId: string, type: 'linkset' | 'lens', id: number, props: ClustersProperties) {
    const queryClient = useQueryClient();
    const resetClusters = () => {
        queryClient.invalidateQueries({queryKey: ['clusters', jobId, type, id, props]});
        queryClient.invalidateQueries({queryKey: ['clusters_totals', jobId, type, id, props]});
    };
    return {resetClusters};
}

async function loadClusters(jobId: string, type: 'linkset' | 'lens', id: number, page: number, props: ClustersProperties): Promise<MinimalCluster[]> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters`, {
        method: 'POST',
        body: createClustersFormData(props, page)
    });

    if (!response.ok)
        throw new Error('Unable to fetch clusters!');

    const results = await response.json();
    return results.map((cluster: Cluster, idx: number) => ({
        ...cluster,
        count: (pageSize * page) + idx + 1
    }));
}

async function loadClusterSelectionTotals(jobId: string, type: 'linkset' | 'lens', id: number, clusterIds: number[]): Promise<Record<number, ClusterTotals>> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters`, {
        method: 'POST',
        body: createClustersAddedFormData(clusterIds, false)
    });

    if (!response.ok)
        throw new Error('Unable to fetch cluster totals for selection!');

    const results: Cluster[] = await response.json();
    return results.reduce<Record<number, ClusterTotals>>((acc, cluster) => {
        acc[cluster.id] = {
            links: cluster.links,
            size: cluster.size
        };
        return acc;
    }, {});
}

async function loadClusterSelectionProps(jobId: string, type: 'linkset' | 'lens', id: number, clusterIds: number[]): Promise<Record<number, PropertyValues[]>> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters`, {
        method: 'POST',
        body: createClustersAddedFormData(clusterIds, true)
    });

    if (!response.ok)
        throw new Error('Unable to fetch cluster props for selection!');

    const results: Cluster[] = await response.json();
    return results.reduce<Record<number, PropertyValues[]>>((acc, cluster) => {
        acc[cluster.id] = cluster.values || [];
        return acc;
    }, {});
}

async function loadClustersTotals(jobId: string, type: 'linkset' | 'lens', id: number, props?: ClustersTotalsProperties): Promise<ClustersTotals> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/clusters/totals`, {
        method: 'POST',
        body: createClustersTotalsFormData(props)
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

function createClustersTotalsFormData(props?: ClustersTotalsProperties) {
    const data = new FormData();
    data.append('apply_filters', props ? 'true' : 'false');

    if (props) {
        props.minSize && data.append('min_size', props.minSize.toString());
        props.maxSize && data.append('max_size', props.maxSize.toString());

        props.minCount && data.append('min_count', props.minCount.toString());
        props.maxCount && data.append('max_count', props.maxCount.toString());
    }

    return data;
}

function createClustersFormData(props: ClustersProperties, page?: number) {
    const data = createClustersTotalsFormData(props);
    data.append('with_properties', 'none');

    props.sort && data.append('sort', props.sort);

    if (page !== undefined) {
        data.append('limit', pageSize.toString());
        data.append('offset', (pageSize * page).toString());
    }

    return data;
}

function createClustersAddedFormData(clusterIds: number[], isPropsQuery: boolean) {
    const data = new FormData();
    data.append('apply_filters', isPropsQuery ? 'true' : 'false');
    data.append('with_properties', isPropsQuery ? 'multiple' : 'none');

    for (const clusterId of clusterIds)
        data.append('cluster_ids', clusterId.toString());

    return data;
}
