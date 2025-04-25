import {useState} from 'react';
import {ResultItem, Results} from 'components/Results.tsx';
import DownloadStatus from 'components/DownloadStatus.tsx';
import {useDatasetsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import {EntityType, TimbuctooDataset, TimbuctooDatasetRef} from 'utils/interfaces.ts';
import {LabelGroup, Properties} from 'utils/components.tsx';
import classes from './DatasetBrowser.module.css';

export default function DatasetBrowser({datasetRef, updateDatasetRef}: {
    datasetRef: TimbuctooDatasetRef | null,
    updateDatasetRef: (datasetRef: TimbuctooDatasetRef) => void
}) {
    if (datasetRef === null)
        datasetRef = {
            type: 'timbuctoo',
            graphql_endpoint: '',
            timbuctoo_id: '',
            entity_type_id: '',
        };

    function updateEndpoint(endpoint: string) {
        updateDatasetRef({
            ...(datasetRef as TimbuctooDatasetRef),
            graphql_endpoint: endpoint,
        });
    }

    return (
        <div className={classes.datasetBrowser}>
            <EndpointSelection endpoint={datasetRef.graphql_endpoint} onNewEndpoint={updateEndpoint}/>
            <DataSelection datasetRef={datasetRef} updateDatasetRef={updateDatasetRef}/>
        </div>
    );
}

function EndpointSelection({endpoint, onNewEndpoint}: { endpoint: string, onNewEndpoint: (endpoint: string) => void }) {
    const [curEndpoint, setEndpoint] = useState(endpoint);

    return (
        <LabelGroup label="Timbuctoo GraphQL endpoint" className={classes.endpoint}>
            <input type="text" value={curEndpoint} onChange={e => setEndpoint(e.target.value)}
                   onBlur={_ => onNewEndpoint(curEndpoint)}/>
        </LabelGroup>
    );
}

function DataSelection({datasetRef, updateDatasetRef}: {
    datasetRef: TimbuctooDatasetRef,
    updateDatasetRef: (datasetRef: TimbuctooDatasetRef) => void
}) {
    const {data} = useDatasetsTimbuctoo(datasetRef.graphql_endpoint);

    function updateTimbuctooId(timbuctooId: string) {
        updateDatasetRef({...datasetRef, timbuctoo_id: timbuctooId});
    }

    function updateEntityTypeId(entityTypeId: string) {
        updateDatasetRef({...datasetRef, entity_type_id: entityTypeId});
    }

    return (
        <div className={classes.dataSelection}>
            <DatasetSelection datasets={data}
                              selectedDataset={datasetRef.timbuctoo_id}
                              setSelectedDataset={updateTimbuctooId}/>

            {datasetRef.timbuctoo_id !== '' && <EntitySelection
                datasetRef={datasetRef}
                entityTypes={data[datasetRef.timbuctoo_id].entity_types}
                setSelectedCollection={updateEntityTypeId}/>}
        </div>
    );
}

function DatasetSelection({datasets, selectedDataset, setSelectedDataset}: {
    datasets: { [timbuctooId: string]: TimbuctooDataset }
    selectedDataset: string,
    setSelectedDataset: (datasetId: string) => void
}) {
    return (
        <Results className={classes.datasets} distinctLines={false}>
            {Object.entries(datasets).map(([datasetId, dataset]) =>
                <ResultItem key={datasetId} isSelected={selectedDataset === datasetId}
                            onClick={() => setSelectedDataset(datasetId)}>
                    <DatasetReference dataset={dataset}/>
                </ResultItem>
            )}
        </Results>
    );
}

function DatasetReference({dataset}: { dataset: TimbuctooDataset }) {
    const name = dataset.timbuctoo_id.split('__')[1];

    return (
        <div>
            <div className={classes.title}>
                {dataset.title}

                {dataset.title !== name && <span className={classes.name}>
                    {name}
                </span>}
            </div>

            {dataset.description && <div className={classes.description}>
                {dataset.description}
            </div>}
        </div>
    );
}

function EntitySelection({datasetRef, entityTypes, setSelectedCollection}: {
    datasetRef: TimbuctooDatasetRef,
    entityTypes: { [entityTypeId: string]: EntityType },
    setSelectedCollection: (entityTypeId: string,) => void
}) {
    return (
        <Results distinctLines={false} className={classes.entities}>
            {Object.entries(entityTypes).map(([entityTypeId, entityType]) =>
                <ResultItem key={entityTypeId} isSelected={datasetRef.entity_type_id === entityTypeId}
                            onClick={() => setSelectedCollection(entityTypeId)}>
                    <EntityReference entityType={entityType} datasetRef={datasetRef}/>
                </ResultItem>
            )}
        </Results>
    );
}

function EntityReference({entityType, datasetRef}: {
    entityType: EntityType,
    datasetRef: TimbuctooDatasetRef
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
                <DownloadStatus datasetRef={{...datasetRef, entity_type_id: entityType.id}}/>
            </Properties>
        </div>
    );
}
