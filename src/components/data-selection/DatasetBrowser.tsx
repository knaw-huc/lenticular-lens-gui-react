import {useState} from 'react';
import {ResultItem, Results} from 'components/Results.tsx';
import DownloadStatus from 'components/DownloadStatus.tsx';
import {useDatasets} from 'queries/datasets.ts';
import {Collection, Dataset, DatasetRef} from 'utils/interfaces.ts';
import {LabelGroup, Properties} from 'utils/components.tsx';
import classes from './DatasetBrowser.module.css';

export default function DatasetBrowser({datasetRef, updateDatasetRef}: {
    datasetRef: DatasetRef,
    updateDatasetRef: (datasetRef: DatasetRef) => void
}) {
    function updateEndpoint(endpoint: string) {
        updateDatasetRef({...datasetRef, timbuctoo_graphql: endpoint});
    }

    return (
        <div className={classes.datasetBrowser}>
            <EndpointSelection endpoint={datasetRef.timbuctoo_graphql} onNewEndpoint={updateEndpoint}/>
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
    datasetRef: DatasetRef,
    updateDatasetRef: (datasetRef: DatasetRef) => void
}) {
    const {data} = useDatasets(datasetRef.timbuctoo_graphql);

    function updateDataset(datasetId: string) {
        updateDatasetRef({...datasetRef, dataset_id: datasetId});
    }

    function updateCollection(collectionId: string) {
        updateDatasetRef({...datasetRef, collection_id: collectionId});
    }

    return (
        <div className={classes.dataSelection}>
            <DatasetSelection datasets={data}
                              selectedDataset={datasetRef.dataset_id}
                              setSelectedDataset={updateDataset}/>

            {datasetRef.dataset_id !== '' && <EntitySelection
                datasetRef={datasetRef}
                collections={data[datasetRef.dataset_id].collections}
                setSelectedCollection={updateCollection}/>}
        </div>
    );
}

function DatasetSelection({datasets, selectedDataset, setSelectedDataset}: {
    datasets: { [datasetId: string]: Dataset }
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

function EntitySelection({datasetRef, collections, setSelectedCollection}: {
    datasetRef: DatasetRef,
    collections: { [collectionId: string]: Collection },
    setSelectedCollection: (collectionId: string,) => void
}) {
    return (
        <Results distinctLines={false} className={classes.entities}>
            {Object.entries(collections).map(([collectionId, collection]) =>
                <ResultItem key={collectionId} isSelected={datasetRef.collection_id === collectionId}
                            onClick={() => setSelectedCollection(collectionId)}>
                    <EntityReference collection={collection} collectionId={collectionId} datasetRef={datasetRef}/>
                </ResultItem>
            )}
        </Results>
    );
}

function EntityReference({collection, collectionId, datasetRef}: {
    collection: Collection,
    collectionId: string,
    datasetRef: DatasetRef
}) {
    return (
        <div>
            <div className={classes.title}>
                {collection.title || collection.shortenedUri}

                {collection.title && <span className={classes.name}>
                    {collection.shortenedUri}
                </span>}
            </div>

            <Properties>
                <div>Total entities: {collection.total.toLocaleString('en')}</div>
                <DownloadStatus graphqlEndpoint={datasetRef.timbuctoo_graphql}
                                datasetId={datasetRef.dataset_id}
                                collectionId={collectionId}/>
            </Properties>
        </div>
    );
}
