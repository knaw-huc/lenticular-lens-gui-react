import {ChangeEvent} from 'react';
import {LabelGroup} from 'utils/components.tsx';
import {TimbuctooDatasetRef} from 'utils/interfaces.ts';

export default function TimbuctooSelection({datasetRef, updateDatasetRef}: {
    datasetRef: TimbuctooDatasetRef,
    updateDatasetRef: (datasetRef: TimbuctooDatasetRef) => void
}) {
    function onChangeGraphqlEndpoint(e: ChangeEvent<HTMLInputElement>) {
        datasetRef.graphql_endpoint = e.target.value.trim();
        updateDatasetRef(datasetRef);
    }

    return (
        <LabelGroup label="Timbuctoo GraphQL endpoint">
            <input type="text" name="graphql_endpoint" value={datasetRef.graphql_endpoint}
                   onChange={onChangeGraphqlEndpoint}/>
        </LabelGroup>
    );
}
