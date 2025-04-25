import {useDatasetsTimbuctoo, datasetRefIsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import {useDownloadsTimbuctoo, startDownloadTimbuctoo} from 'queries/downloads_timbuctoo.ts';
import {DatasetRef, Dataset, EntityType, Download, TimbuctooDatasetRef} from 'utils/interfaces.ts';

interface DatasetHook {
    dataset: Dataset;
    entityType: EntityType;
    getDownloadInfo: (entityTypeId: string) => Download | null;
    startDownload: (entityTypeId: string) => Promise<Response>;
}

export default function useDataset(datasetRef: DatasetRef): DatasetHook | undefined {
    if (datasetRefIsTimbuctoo(datasetRef))
        return withTimbuctooDataset(datasetRef);
}

function withTimbuctooDataset(datasetRef: TimbuctooDatasetRef): DatasetHook {
    const {data: downloads} = useDownloadsTimbuctoo();
    const {data} = useDatasetsTimbuctoo(datasetRef.graphql_endpoint);

    const dataset = data[datasetRef.timbuctoo_id];
    const entityType = dataset.entity_types[datasetRef.entity_type_id];

    return {
        dataset,
        entityType,
        getDownloadInfo: (entityTypeId: string) =>
            downloads.find(downloadInfo =>
                downloadInfo.graphql_endpoint === datasetRef.graphql_endpoint &&
                downloadInfo.timbuctoo_id === datasetRef.timbuctoo_id &&
                downloadInfo.entity_type_id === entityTypeId) || null,
        startDownload: (entityTypeId: string) =>
            startDownloadTimbuctoo(datasetRef.graphql_endpoint, datasetRef.timbuctoo_id, entityTypeId),
    };
}
