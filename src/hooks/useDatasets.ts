import {useQueryClient} from '@tanstack/react-query';
import {useDatasetsTimbuctoo, datasetRefIsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import {startDownloadTimbuctoo, useDownloadsTimbuctoo} from 'queries/downloads_timbuctoo.ts';
import {datasetRefIsSPARQL, resetDatasetsSPARQL, runLoadSPARQL, useDatasetsSPARQL} from 'queries/datasets_sparql.ts';
import {startDownloadSPARQL, useDownloadsSPARQL} from 'queries/downloads_sparql.ts';
import {DatasetRef, Dataset, TimbuctooDatasetRef, SPARQLDatasetRef, Download} from 'utils/interfaces.ts';

interface DatasetsHook<D extends DatasetRef> {
    datasets: { [id: string]: Dataset };
    datasetIdentifier: keyof D | null;
    metadataLoadingStatus: 'to_be_requested' | 'waiting' | 'running' | 'finished' | 'failed';
    loadMetadata?: () => Promise<boolean>;
    getDownloadInfo: (entityTypeId: string) => Download | null;
    startDownload: (entityTypeId: string) => Promise<Response>;
}

export default function useDatasets(datasetRef: DatasetRef): DatasetsHook<any> {
    const isTimbuctoo = datasetRefIsTimbuctoo(datasetRef);
    const isSPARQL = datasetRefIsSPARQL(datasetRef);

    const timbuctoo = withTimbuctooDataset(datasetRef as TimbuctooDatasetRef);
    const sparql = withSPARQLDataset(datasetRef as SPARQLDatasetRef);

    if (isTimbuctoo)
        return timbuctoo;
    if (isSPARQL)
        return sparql;
    return timbuctoo;
}

function withTimbuctooDataset(datasetRef: TimbuctooDatasetRef): DatasetsHook<TimbuctooDatasetRef> {
    const {data: downloads} = useDownloadsTimbuctoo();
    const {data: datasets} = useDatasetsTimbuctoo(datasetRef.graphql_endpoint || '');

    return {
        datasets,
        datasetIdentifier: 'timbuctoo_id',
        metadataLoadingStatus: 'finished',
        getDownloadInfo: (entityTypeId: string) =>
            downloads.find(downloadInfo =>
                downloadInfo.graphql_endpoint === datasetRef.graphql_endpoint &&
                downloadInfo.timbuctoo_id === datasetRef.timbuctoo_id &&
                downloadInfo.entity_type_id === entityTypeId) || null,
        startDownload: (entityTypeId: string) =>
            startDownloadTimbuctoo(datasetRef.graphql_endpoint, datasetRef.timbuctoo_id, entityTypeId),
    };
}

function withSPARQLDataset(datasetRef: SPARQLDatasetRef): DatasetsHook<SPARQLDatasetRef> {
    const queryClient = useQueryClient();
    const {data: downloads} = useDownloadsSPARQL();
    const {data: datasets} = useDatasetsSPARQL(datasetRef.sparql_endpoint || '');

    return {
        datasets,
        datasetIdentifier: null,
        metadataLoadingStatus: datasetRef.sparql_endpoint in datasets ? datasets[datasetRef.sparql_endpoint].status : 'to_be_requested',
        loadMetadata: async () => {
            const result = await runLoadSPARQL(datasetRef.sparql_endpoint);
            resetDatasetsSPARQL(queryClient, datasetRef.sparql_endpoint);
            return result;
        },
        getDownloadInfo: (entityTypeId: string) =>
            downloads.find(downloadInfo =>
                downloadInfo.sparql_endpoint === datasetRef.sparql_endpoint &&
                downloadInfo.entity_type_id === entityTypeId) || null,
        startDownload: (entityTypeId: string) =>
            startDownloadSPARQL(datasetRef.sparql_endpoint, entityTypeId),
    };
}
