import Modal from 'components/Modal.tsx';
import DownloadStatus from 'components/DownloadStatus.tsx';
import DatasetBrowser from 'components/data-selection/DatasetBrowser.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {useDatasets} from 'queries/datasets.ts';
import {LabelGroup} from 'utils/components.tsx';
import {DatasetRef, EntityTypeSelection} from 'utils/interfaces.ts';
import classes from './Dataset.module.css';

export default function Dataset({ets, isInUse}: { ets: EntityTypeSelection, isInUse: boolean }) {
    const {update} = useEntityTypeSelections();
    const {data} = useDatasets(ets.dataset.timbuctoo_graphql);
    const dataset = ets.dataset.dataset_id in data ? data[ets.dataset.dataset_id] : null;
    const collection = dataset?.collections && ets.dataset.collection_id in dataset?.collections
        ? dataset.collections[ets.dataset.collection_id] : null;

    function updateDatasetRef(datasetRef: DatasetRef) {
        !isInUse && update(ets.id, entityTypeSelection => entityTypeSelection.dataset = datasetRef);
    }

    return (
        <div className={classes.dataset}>
            <div className={classes.entitySelector}>
                <LabelGroup label="Timbuctoo GraphQL endpoint">
                    {ets.dataset.timbuctoo_graphql}
                </LabelGroup>

                <LabelGroup label="Dataset" className={classes.datasetColumn}>
                    {dataset?.title || <span className={classes.placeholder}>No dataset selected yet</span>}

                    {dataset && dataset.title !== dataset.name && <div className={classes.extra}>
                        {dataset.name}
                    </div>}
                </LabelGroup>

                <LabelGroup label="Entity" className={classes.entityColumn}>
                    {collection?.title || collection?.shortenedUri ||
                        <span className={classes.placeholder}>No entity type selected yet</span>}

                    {collection?.title && <div className={classes.extra}>
                        {collection.shortenedUri}
                    </div>}

                    {collection && <DownloadStatus className={classes.extra}
                                                   graphqlEndpoint={ets.dataset.timbuctoo_graphql}
                                                   datasetId={ets.dataset.dataset_id}
                                                   collectionId={ets.dataset.collection_id}/>}
                </LabelGroup>

                {dataset?.description && <p className={classes.description}>
                    {dataset.description}
                </p>}
            </div>

            <div>
                <Modal title="Select data" fullScreenMode
                       trigger={<button type="button" disabled={isInUse}>Select data</button>}>
                    <DatasetBrowser datasetRef={ets.dataset} updateDatasetRef={updateDatasetRef}/>
                </Modal>
            </div>
        </div>
    );
}
