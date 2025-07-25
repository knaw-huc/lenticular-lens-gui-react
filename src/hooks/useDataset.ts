import {useDatasetsTimbuctoo, datasetRefIsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import {datasetRefIsSPARQL, useDatasetsSPARQL} from 'queries/datasets_sparql.ts';
import {DatasetRef, Dataset, EntityType, TimbuctooDatasetRef, SPARQLDatasetRef} from 'utils/interfaces.ts';

interface DatasetHook {
    dataset: Dataset | null;
    entityType: EntityType | null;
}

export default function useDataset(datasetRef: DatasetRef): DatasetHook {
    const isTimbuctoo = datasetRefIsTimbuctoo(datasetRef);
    const isSPARQL = datasetRefIsSPARQL(datasetRef);

    const timbuctoo = withTimbuctooDataset(datasetRef as TimbuctooDatasetRef);
    const sparql = withSPARQLDataset(datasetRef as SPARQLDatasetRef);

    return isTimbuctoo ? timbuctoo : (isSPARQL ? sparql : {dataset: null, entityType: null});
}

function withTimbuctooDataset(datasetRef: TimbuctooDatasetRef): DatasetHook {
    const {data: datasets} = useDatasetsTimbuctoo(datasetRef.graphql_endpoint || '');

    const dataset = datasets ? datasets[datasetRef.timbuctoo_id] : null;
    const entityType = dataset ? dataset.entity_types[datasetRef.entity_type_id] : null;

    return {dataset, entityType};
}

function withSPARQLDataset(datasetRef: SPARQLDatasetRef): DatasetHook {
    const {data: datasets} = useDatasetsSPARQL(datasetRef.sparql_endpoint || '');

    const dataset = datasets ? datasets[datasetRef.sparql_endpoint] : null;
    const entityType = dataset ? dataset.entity_types[datasetRef.entity_type_id] : null;

    return {dataset, entityType};
}
