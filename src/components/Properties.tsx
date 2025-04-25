import Property from 'components/Property.tsx';
import DraggableList from 'components/DraggableList.tsx';
import {DatasetRef} from 'utils/interfaces.ts';

export default function Properties({properties, datasetRef, onChange, className}: {
    properties: string[][],
    datasetRef: DatasetRef,
    onChange: (newProperties: string[][]) => void,
    className?: string
}) {
    function changeProperties(index: number, isAddition: boolean) {
        const newProperties = [...properties];
        isAddition
            ? newProperties.splice(index + 1, 0, [''])
            : newProperties.splice(index, 1);
        onChange(newProperties);
    }

    function changeProperty(index: number, newProperty: string[]) {
        const newProperties = [...properties];
        newProperties[index] = newProperty;
        onChange(newProperties);
    }

    return (
        <DraggableList className={className} list={properties} onChange={onChange}>
            {(property, idx) =>
                <Property property={property} datasetRef={datasetRef} allowCollapse
                          onAdd={() => changeProperties(idx, true)}
                          onRemove={properties.length > 1 ? () => changeProperties(idx, false) : undefined}
                          onChange={newProperty => changeProperty(idx, newProperty)}/>}
        </DraggableList>
    );
}
