import Modal from 'components/Modal.tsx';
import DownloadStatus from 'components/DownloadStatus.tsx';
import DatasetBrowser from 'components/data-selection/DatasetBrowser.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {useDatasetsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import {LabelGroup} from 'utils/components.tsx';
import {DatasetRef, EntityTypeSelection, TimbuctooDatasetRef} from 'utils/interfaces.ts';
import classes from './TimuctooDataset.module.css';

export default function TimbuctooDataset({ets, datasetRef, isInUse}: {
    ets: EntityTypeSelection,
    datasetRef: TimbuctooDatasetRef,
    isInUse: boolean
}) {
    const {update} = useEntityTypeSelections();
    const {data} = useDatasetsTimbuctoo(datasetRef.graphql_endpoint);
    const dataset = datasetRef.timbuctoo_id in data ? data[datasetRef.timbuctoo_id] : null;
    const entityType = dataset?.entity_types && datasetRef.entity_type_id in dataset?.entity_types ? dataset.entity_types[datasetRef.entity_type_id] : null;
    const name = dataset ? dataset.timbuctoo_id.split('__')[1] : null;

    function updateDatasetRef(datasetRef: DatasetRef) {
        !isInUse && update(ets.id, entityTypeSelection => entityTypeSelection.dataset = datasetRef);
    }

    return (
        <div className={classes.dataset}>
            <div className={classes.entitySelector}>
                <LabelGroup label="Timbuctoo GraphQL endpoint">
                    {datasetRef.graphql_endpoint}
                </LabelGroup>

                <LabelGroup label="Dataset" className={classes.datasetColumn}>
                    {dataset?.title || <span className={classes.placeholder}>No dataset selected yet</span>}

                    {dataset && name && dataset.title !== name && <div className={classes.extra}>
                        {name}
                    </div>}
                </LabelGroup>

                <LabelGroup label="Entity" className={classes.entityColumn}>
                    {entityType?.label || entityType?.shortened_uri ||
                        <span className={classes.placeholder}>No entity type selected yet</span>}

                    {entityType?.label && <div className={classes.extra}>
                        {entityType.shortened_uri}
                    </div>}

                    {entityType && <DownloadStatus className={classes.extra} datasetRef={datasetRef}/>}
                </LabelGroup>

                {dataset?.description && <p className={classes.description}>
                    {dataset.description}
                </p>}
            </div>

            <div>
                <Modal title="Select data" fullScreenMode
                       trigger={<button type="button" disabled={isInUse}>Select data</button>}>
                    <DatasetBrowser datasetRef={ets.dataset as TimbuctooDatasetRef | null}
                                    updateDatasetRef={updateDatasetRef}/>
                </Modal>
            </div>
        </div>
    );
}
