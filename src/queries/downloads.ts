import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {Download, Downloads} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const downloadsOptions = queryOptions({
    queryKey: ['downloads'],
    staleTime: 60 * 1000 * 15, // 15 minutes
    queryFn: loadDownloads,
});

export function prefetchDownloads(queryClient: QueryClient) {
    queryClient.prefetchQuery(downloadsOptions); // Just prefetch without awaiting
}

export function resetDownloads(queryClient: QueryClient) {
    queryClient.invalidateQueries(downloadsOptions);
}

export function useDownloads() {
    return useSuspenseQuery(downloadsOptions);
}

export async function startDownload(graphqlEndpoint: string, datasetId: string, collectionId: string) {
    const params = [`endpoint=${graphqlEndpoint}`, `dataset_id=${datasetId}`, `collection_id=${collectionId}`];
    return fetch(`${api}/download?${params.join('&')}`);
}

async function loadDownloads(): Promise<Downloads> {
    const response = await fetch(`${api}/downloads`);
    if (!response.ok)
        throw new Error('Unable to fetch all downloads!');

    return response.json();
}

export function updateDownload(queryClient: QueryClient, download: Download) {
    queryClient.setQueryData(['downloads'], (old: Downloads) => {
        if (!old)
            return undefined;

        const newDownloads = {
            downloaded: [...old.downloaded],
            downloading: [...old.downloading]
        };

        const downloadedIdx = newDownloads.downloaded.findIndex(d =>
            d.graphql_endpoint === download.graphql_endpoint &&
            d.dataset_id === download.dataset_id &&
            d.collection_id === download.collection_id);

        if (downloadedIdx > -1)
            newDownloads.downloaded.splice(downloadedIdx, 1);

        const downloadingIdx = newDownloads.downloading.findIndex(d =>
            d.graphql_endpoint === download.graphql_endpoint &&
            d.dataset_id === download.dataset_id &&
            d.collection_id === download.collection_id);

        if (downloadingIdx > -1)
            newDownloads.downloading.splice(downloadingIdx, 1);

        if (download.total === download.rows_count)
            newDownloads.downloaded.push(download);
        else
            newDownloads.downloading.push(download);

        return newDownloads;
    });
}
