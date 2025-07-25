import {IconAutomation, IconX} from '@tabler/icons-react';
import Modal from 'components/Modal.tsx';
import Checkbox from 'components/Checkbox.tsx';
import DownloadStatus from 'components/DownloadStatus.tsx';
import DatasetBrowser from 'components/data-selection/DatasetBrowser.tsx';
import SPARQLSelection from 'components/data-selection/SPARQLSelection.tsx';
import TimbuctooSelection from 'components/data-selection/TimbuctooSelection.tsx';
import {datasetRefIsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import {datasetRefIsSPARQL} from 'queries/datasets_sparql.ts';
import useDataset from 'hooks/useDataset.ts';
import useDatasets from 'hooks/useDatasets.ts';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {ButtonGroup, Form, LabelGroup, Spinner} from 'utils/components.tsx';
import {DatasetRef, EntityTypeSelection, SPARQLDatasetRef, TimbuctooDatasetRef} from 'utils/interfaces.ts';
import classes from './DatasetSelection.module.css';

export default function DatasetSelection({ets, isInUse}: { ets: EntityTypeSelection, isInUse: boolean }) {
    const {update} = useEntityTypeSelections();
    if (!ets.dataset)
        updateDatasetRef({
            type: 'timbuctoo',
            graphql_endpoint: 'https://repository.goldenagents.org/v5/graphql',
            timbuctoo_id: '',
            entity_type_id: ''
        } as TimbuctooDatasetRef);

    const datasetRef = ets.dataset!;

    function updateDatasetRef(datasetRef: DatasetRef) {
        !isInUse && update(ets.id, entityTypeSelection => entityTypeSelection.dataset = datasetRef);
    }

    function updateDatasetRefInline(datasetRef: DatasetRef) {
        update(ets.id, entityTypeSelection =>
            entityTypeSelection.dataset && Object.assign(entityTypeSelection.dataset, datasetRef));
    }

    function updateDataSource(type: 'timbuctoo' | 'sparql') {
        switch (type) {
            case 'sparql':
                updateDatasetRef({
                    type: 'sparql',
                    sparql_endpoint: '',
                    entity_type_id: ''
                } as SPARQLDatasetRef);
                return;
            case 'timbuctoo':
            default:
                updateDatasetRef({
                    type: 'timbuctoo',
                    graphql_endpoint: 'https://repository.goldenagents.org/v5/graphql',
                    timbuctoo_id: '',
                    entity_type_id: ''
                } as TimbuctooDatasetRef);
        }
    }

    return (
        <div className={classes.dataset}>
            <Form isDisabled={isInUse}>
                <DataSourceSelection datasetRef={datasetRef} updateDataSource={updateDataSource}/>
                <DataSourceSelectionConfiguration datasetRef={datasetRef} updateDatasetRef={updateDatasetRefInline}/>
                <DataSelected datasetRef={datasetRef}/>
            </Form>

            <DataSelection datasetRef={datasetRef} updateDatasetRef={updateDatasetRef} isInUse={isInUse}/>
        </div>
    );
}

function DataSourceSelection({datasetRef, updateDataSource}: {
    datasetRef: DatasetRef,
    updateDataSource: (type: 'timbuctoo' | 'sparql') => void
}) {
    return (
        <LabelGroup inline={true} label="Data source" className={classes.type}>
            <ButtonGroup>
                <Checkbox asButton checked={datasetRef.type === 'timbuctoo'}
                          onCheckedChange={_ => updateDataSource('timbuctoo')}>
                    Timbuctoo
                </Checkbox>

                <Checkbox asButton checked={datasetRef.type === 'sparql'}
                          onCheckedChange={_ => updateDataSource('sparql')}>
                    SPARQL
                </Checkbox>
            </ButtonGroup>
        </LabelGroup>
    );
}

function DataSourceSelectionConfiguration({datasetRef, updateDatasetRef}: {
    datasetRef: DatasetRef,
    updateDatasetRef: (datasetRef: DatasetRef) => void
}) {
    return (
        <>
            {datasetRefIsTimbuctoo(datasetRef) &&
                <TimbuctooSelection datasetRef={datasetRef} updateDatasetRef={updateDatasetRef}/>}

            {datasetRefIsSPARQL(datasetRef) &&
                <SPARQLSelection datasetRef={datasetRef} updateDatasetRef={updateDatasetRef}/>}
        </>
    );
}

function DataSelected({datasetRef}: { datasetRef: DatasetRef }) {
    const {dataset, entityType} = useDataset(datasetRef);

    return (
        <div className={classes.entitySelector}>
            {datasetRefIsTimbuctoo(datasetRef) && <LabelGroup label="Dataset" className={classes.datasetColumn}>
                {dataset?.title || <span className={classes.placeholder}>No dataset selected yet</span>}

                {dataset && dataset.name && dataset.title !== dataset.name && <div className={classes.extra}>
                    {dataset.name}
                </div>}
            </LabelGroup>}

            <LabelGroup label="Entity" className={classes.entityColumn}>
                {entityType?.label || entityType?.shortened_uri ||
                    <span className={classes.placeholder}>No entity type selected yet</span>}

                {entityType?.label && <div className={classes.extra}>
                    {entityType.shortened_uri}
                </div>}

                {entityType && <DownloadStatus className={classes.extra}
                                               datasetRef={datasetRef} entityType={entityType}/>}
            </LabelGroup>

            {dataset?.description && <p className={classes.description}>
                {dataset.description}
            </p>}
        </div>
    );
}

function DataSelection({datasetRef, updateDatasetRef, isInUse}: {
    datasetRef: DatasetRef,
    updateDatasetRef: (datasetRef: DatasetRef) => void,
    isInUse: boolean
}) {
    const {metadataLoadingStatus, loadMetadata} = useDatasets(datasetRef);
    const disallowDataSelectionModel = isInUse || metadataLoadingStatus !== 'finished';

    return (
        <div className={classes.dataSelection}>
            {['to_be_requested', 'failed'].includes(metadataLoadingStatus) && <button onClick={loadMetadata}>
                <IconAutomation size="1.3em"/>
                {metadataLoadingStatus === 'to_be_requested' && 'Load entity types from data source'}
                {metadataLoadingStatus === 'failed' && 'Try again to load entity types'}
            </button>}

            {!['to_be_requested', 'failed'].includes(metadataLoadingStatus) &&
                <Modal title="Select data" fullScreenMode
                       trigger={<button disabled={disallowDataSelectionModel}>Select data</button>}>
                    <DatasetBrowser datasetRef={datasetRef} updateDatasetRef={updateDatasetRef}/>
                </Modal>}

            {['waiting', 'running', 'failed'].includes(metadataLoadingStatus) && <div className={classes.status}>
                {metadataLoadingStatus === 'waiting' && 'Waiting to load entity types'}

                {metadataLoadingStatus === 'running' && <>
                    <Spinner type="inline" className={classes.running}/>
                    Loading entity types
                </>}

                {metadataLoadingStatus === 'failed' && <>
                    <IconX size="1.3em" className={classes.failed}/>
                    Failed to load entity types
                </>}
            </div>}
        </div>
    );
}
