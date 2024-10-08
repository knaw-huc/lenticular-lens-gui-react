import clsx from 'clsx';
import Property from 'components/Property.tsx';
import Transformers from 'components/alignment/Transformers.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {AppliedTransformer, Conditions, PropertyCondition} from 'utils/interfaces.ts';
import classes from './SourceTargetConfiguration.module.css';

export default function SourceTargetConfiguration({isSource, conditions, canUpdate, onUpdate}: {
    isSource: boolean,
    conditions: Conditions,
    canUpdate: boolean,
    onUpdate: <P extends keyof Conditions>(prop: P, value: Conditions[P]) => void
}) {
    return (
        <fieldset disabled={!canUpdate}>
            <h3>{isSource ? 'Source' : 'Target'}</h3>

            <PropertiesConfiguration properties={conditions.properties} canUpdate={canUpdate}
                                     onUpdate={props => onUpdate('properties', props)}
                                     addListTransformer={() => onUpdate('transformers',
                                         [...conditions.transformers, {name: '', parameters: {}}])}/>

            {conditions.transformers.length > 0 && <div className={classes.transformers}>
                <Transformers transformers={conditions.transformers} canUpdate={canUpdate}
                              onUpdate={transformers => onUpdate('transformers', transformers)}/>
            </div>}
        </fieldset>
    );
}

function PropertiesConfiguration({properties, canUpdate, onUpdate, addListTransformer}: {
    properties: { [ets: number]: PropertyCondition[] },
    canUpdate: boolean,
    onUpdate: (properties: { [ets: number]: PropertyCondition[] }) => void,
    addListTransformer: () => void
}) {
    const {entityTypeSelections} = useEntityTypeSelections();
    const props = Object.entries(properties).flatMap(([ets, propConditions]) =>
        propConditions.map((propertyCondition, idx) => [
            ets, propConditions.length, propertyCondition, idx
        ] as [string, number, PropertyCondition, number]));

    function changeProperties(ets: number, index: number, isAddition: boolean) {
        const newProperties = [...properties[ets]];
        isAddition
            ? newProperties.splice(index + 1, 0, {property: [''], transformers: []})
            : newProperties.splice(index, 1);
        onUpdate({...properties, [ets]: newProperties});
    }

    function addTransformer(ets: number, index: number) {
        const newProperties = [...properties[ets]];
        newProperties[index].transformers.unshift({name: '', parameters: {}});
        onUpdate({...properties, [ets]: newProperties});
    }

    function changeProperty(ets: number, index: number, newProperty: string[]) {
        const newProperties = [...properties[ets]];
        newProperties[index] = {property: newProperty, transformers: newProperties[index].transformers};
        onUpdate({...properties, [ets]: newProperties});
    }

    function onUpdateTransformers(ets: number, index: number, newTransformers: AppliedTransformer[]) {
        const newProperties = [...properties[ets]];
        newProperties[index] = {property: newProperties[index].property, transformers: newTransformers};
        onUpdate({...properties, [ets]: newProperties});
    }

    return (
        <div className={classes.properties}>
            {props.map(([ets, size, propertyCondition, idx]) =>
                <div key={`${ets}_${propertyCondition.property.join('_')}`} className={classes.property}>
                    <Property property={propertyCondition.property}
                              datasetRef={entityTypeSelections.find(entity => entity.id === Number(ets))!.dataset}
                              showLabel
                              readOnly={!canUpdate}
                              onAdd={() => changeProperties(parseInt(ets), idx, true)}
                              onTransformerAdd={() => addTransformer(parseInt(ets), idx)}
                              onTransformerListAdd={addListTransformer}
                              onRemove={size > 1 ? () => changeProperties(parseInt(ets), idx, false) : undefined}
                              onChange={newProperty => changeProperty(parseInt(ets), idx, newProperty)}/>

                    {propertyCondition.transformers.length > 0 && <PropertyTransformers
                        transformers={propertyCondition.transformers} canUpdate={canUpdate}
                        onUpdate={transformers =>
                            onUpdateTransformers(parseInt(ets), idx, transformers)}/>}
                </div>
            )}
        </div>
    );
}

function PropertyTransformers({transformers, canUpdate, onUpdate}: {
    transformers: AppliedTransformer[],
    canUpdate: boolean,
    onUpdate: (transformers: AppliedTransformer[]) => void
}) {
    return (
        <div className={clsx(classes.transformers, classes.propertyTransformers)}>
            <Transformers transformers={transformers} canUpdate={canUpdate} onUpdate={onUpdate}/>
        </div>
    );
}
