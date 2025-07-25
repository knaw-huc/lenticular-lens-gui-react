import {ResultItem, Results} from 'components/Results.tsx';
import DownloadStatus from 'components/DownloadStatus.tsx';
import useDataset from 'hooks/useDataset.ts';
import useDatasets from 'hooks/useDatasets.ts';
import {Properties} from 'utils/components.tsx';
import {Dataset, DatasetRef, EntityType} from 'utils/interfaces.ts';
import classes from './DatasetBrowser.module.css';

export default function DatasetBrowser({datasetRef, updateDatasetRef}: {
    datasetRef: DatasetRef,
    updateDatasetRef: (datasetRef: DatasetRef) => void
}) {
    const {datasets, datasetIdentifier} = useDatasets(datasetRef);
    const {dataset} = useDataset(datasetRef);

    function updateDatasetId(datasetId: string) {
        if (datasetIdentifier)
            updateDatasetRef({...datasetRef, [datasetIdentifier]: datasetId});
    }

    function updateEntityTypeId(entityTypeId: string) {
        updateDatasetRef({...datasetRef, entity_type_id: entityTypeId});
    }

    return (
        <div className={classes.dataSelection}>
            {datasetIdentifier &&
                <DatasetSelection datasets={datasets} dataset={dataset} setDataset={updateDatasetId}/>}

            {dataset && <EntitySelection
                datasetRef={datasetRef}
                entityTypes={dataset.entity_types}
                setEntityType={updateEntityTypeId}/>}
        </div>
    );
}

function DatasetSelection({datasets, dataset, setDataset}: {
    datasets: { [datasetId: string]: Dataset }
    dataset: Dataset | null,
    setDataset: (datasetId: string) => void
}) {
    return (
        <Results className={classes.datasets} distinctLines={false}>
            {Object.entries(datasets).map(([datasetId, curDataset]) =>
                <ResultItem key={datasetId} isSelected={dataset?.id === datasetId}
                            onClick={() => setDataset(datasetId)}>
                    <DatasetReference dataset={curDataset}/>
                </ResultItem>
            )}
        </Results>
    );
}

function DatasetReference({dataset}: { dataset: Dataset }) {
    return (
        <div>
            <div className={classes.title}>
                {dataset.title}

                {dataset.title !== dataset.name && <span className={classes.name}>
                    {dataset.name}
                </span>}
            </div>

            {dataset.description && <div className={classes.description}>
                {dataset.description}
            </div>}
        </div>
    );
}

function EntitySelection({datasetRef, entityTypes, setEntityType}: {
    datasetRef: DatasetRef,
    entityTypes: { [entityTypeId: string]: EntityType },
    setEntityType: (entityTypeId: string) => void
}) {
    return (
        <Results distinctLines={false} className={classes.entities}>
            {Object.entries(entityTypes).map(([entityTypeId, entityType]) =>
                <ResultItem key={entityTypeId} isSelected={datasetRef.entity_type_id === entityTypeId}
                            onClick={() => setEntityType(entityTypeId)}>
                    <EntityReference entityType={entityType} datasetRef={datasetRef}/>
                </ResultItem>
            )}
        </Results>
    );
}

function EntityReference({entityType, datasetRef}: {
    entityType: EntityType,
    datasetRef: DatasetRef
}) {
    return (
        <div>
            <div className={classes.title}>
                {entityType.label || entityType.shortened_uri}

                {entityType.label && <span className={classes.name}>
                    {entityType.shortened_uri}
                </span>}
            </div>

            <Properties>
                <div>Total entities: {entityType.total.toLocaleString('en')}</div>
                <DownloadStatus datasetRef={{...datasetRef, entity_type_id: entityType.id}} entityType={entityType}/>
            </Properties>
        </div>
    );
}
