import {useState} from 'react';
import {LabelGroup} from 'utils/components.tsx';
import {SPARQLDatasetRef} from 'utils/interfaces.ts';

export default function SPARQLSelection({datasetRef, updateDatasetRef}: {
    datasetRef: SPARQLDatasetRef,
    updateDatasetRef: (datasetRef: SPARQLDatasetRef) => void
}) {
    const [endpoint, setEndpoint] = useState(datasetRef.sparql_endpoint);

    function onChangeSPARQLEndpoint() {
        datasetRef.sparql_endpoint = endpoint;
        updateDatasetRef(datasetRef);
    }

    return (
        <LabelGroup label="SPARQL endpoint">
            <input type="text" name="sparql_endpoint" value={endpoint}
                   onChange={e => setEndpoint(e.target.value)}
                   onBlur={onChangeSPARQLEndpoint}/>
        </LabelGroup>
    );
}
