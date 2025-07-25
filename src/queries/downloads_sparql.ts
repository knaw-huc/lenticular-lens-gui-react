import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {SPARQLDownload} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const downloadsSPARQLOptions = queryOptions({
    queryKey: ['downloads', 'sparql'],
    staleTime: 60 * 1000 * 15, // 15 minutes
    queryFn: loadDownloadsSPARQL,
});

export function prefetchDownloadsSPARQL(queryClient: QueryClient) {
    queryClient.prefetchQuery(downloadsSPARQLOptions); // Just prefetch without awaiting
}

export function resetDownloadsSPARQL(queryClient: QueryClient) {
    queryClient.invalidateQueries(downloadsSPARQLOptions);
}

export function useDownloadsSPARQL() {
    return useSuspenseQuery(downloadsSPARQLOptions);
}

export async function startDownloadSPARQL(sparqlEndpoint: string, entityTypeId: string) {
    const body = new FormData();
    body.append('sparql_endpoint', sparqlEndpoint);
    body.append('entity_type_id', entityTypeId);

    return fetch(`${api}/datasets/sparql`, {
        method: 'POST',
        body
    });
}

async function loadDownloadsSPARQL(): Promise<SPARQLDownload[]> {
    const response = await fetch(`${api}/datasets/sparql/downloads`);
    if (!response.ok)
        throw new Error('Unable to fetch all SPARQL downloads!');

    return response.json();
}

export function updateDownloadSPARQL(queryClient: QueryClient, download: SPARQLDownload) {
    queryClient.setQueryData(['downloads', 'sparql'], (old: SPARQLDownload[]) => {
        if (!old)
            return undefined;

        const newDownloads = [...old];
        const downloadedIdx = newDownloads.findIndex(d =>
            d.sparql_endpoint === download.sparql_endpoint &&
            d.entity_type_id === download.entity_type_id);

        if (downloadedIdx > -1)
            newDownloads.splice(downloadedIdx, 1);

        newDownloads.push(download);

        return newDownloads;
    });
}
