import TimbuctooDataset from 'components/data-selection/TimbuctooDataset.tsx';
import {datasetRefIsTimbuctoo} from 'queries/datasets_timbuctoo.ts';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {EntityTypeSelection, TimbuctooDatasetRef} from 'utils/interfaces.ts';
import {useEffect} from 'react';

export default function Dataset({ets, isInUse}: { ets: EntityTypeSelection, isInUse: boolean }) {
    const {update} = useEntityTypeSelections();

    useEffect(() => {
        if (!ets.dataset)
            update(ets.id, entityTypeSelection => entityTypeSelection.dataset = {
                type: 'timbuctoo',
                graphql_endpoint: 'https://repository.goldenagents.org/v5/graphql',
                timbuctoo_id: '',
                entity_type_id: ''
            } as TimbuctooDatasetRef);
    }, [ets]);

    if (datasetRefIsTimbuctoo(ets.dataset))
        return <TimbuctooDataset ets={ets} datasetRef={ets.dataset} isInUse={isInUse}/>
}
