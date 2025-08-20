import {useState} from 'react';
import {LabelGroup} from 'utils/components.tsx';
import {TimbuctooDatasetRef} from 'utils/interfaces.ts';

export default function TimbuctooSelection({datasetRef, updateDatasetRef}: {
    datasetRef: TimbuctooDatasetRef,
    updateDatasetRef: (datasetRef: TimbuctooDatasetRef) => void
}) {
    const [endpoint, setEndpoint] = useState(datasetRef.graphql_endpoint);

    function onChangeGraphqlEndpoint() {
        datasetRef.graphql_endpoint = endpoint;
        updateDatasetRef(datasetRef);
    }

    return (
        <LabelGroup label="Timbuctoo GraphQL endpoint">
            <input type="text" name="graphql_endpoint" value={endpoint}
                   onChange={e => setEndpoint(e.target.value)}
                   onBlur={onChangeGraphqlEndpoint}/>
        </LabelGroup>
    );
}
