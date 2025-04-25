import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {TimbuctooDownload} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const downloadsTimbuctooOptions = queryOptions({
    queryKey: ['downloads', 'timbuctoo'],
    staleTime: 60 * 1000 * 15, // 15 minutes
    queryFn: loadDownloadsTimbuctoo,
});

export function prefetchDownloadsTimbuctoo(queryClient: QueryClient) {
    queryClient.prefetchQuery(downloadsTimbuctooOptions); // Just prefetch without awaiting
}

export function resetDownloadsTimbuctoo(queryClient: QueryClient) {
    queryClient.invalidateQueries(downloadsTimbuctooOptions);
}

export function useDownloadsTimbuctoo() {
    return useSuspenseQuery(downloadsTimbuctooOptions);
}

export async function startDownloadTimbuctoo(graphqlEndpoint: string, timbuctooId: string, entityTypeId: string) {
    const body = new FormData();
    body.append('graphql_endpoint', graphqlEndpoint);
    body.append('timbuctoo_id', timbuctooId);
    body.append('entity_type_id', entityTypeId);

    return fetch(`${api}/datasets/timbuctoo`, {
        method: 'POST',
        body
    });
}

async function loadDownloadsTimbuctoo(): Promise<TimbuctooDownload[]> {
    const response = await fetch(`${api}/datasets/timbuctoo/downloads`);
    if (!response.ok)
        throw new Error('Unable to fetch all Timbuctoo downloads!');

    return response.json();
}

export function updateDownloadTimbuctoo(queryClient: QueryClient, download: TimbuctooDownload) {
    queryClient.setQueryData(['downloads', 'timbuctoo'], (old: TimbuctooDownload[]) => {
        if (!old)
            return undefined;

        const newDownloads = [...old];
        const downloadedIdx = newDownloads.findIndex(d =>
            d.graphql_endpoint === download.graphql_endpoint &&
            d.timbuctoo_id === download.timbuctoo_id &&
            d.entity_type_id === download.entity_type_id);

        if (downloadedIdx > -1)
            newDownloads.splice(downloadedIdx, 1);

        newDownloads.push(download);

        return newDownloads;
    });
}
