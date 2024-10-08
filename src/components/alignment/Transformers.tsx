import {IconTrash} from '@tabler/icons-react';
import DraggableList from 'components/DraggableList.tsx';
import ConfigurationItem from 'components/alignment/ConfigurationItem.tsx';
import {useMethods} from 'queries/methods.ts';
import {Form} from 'utils/components.tsx';
import {AppliedTransformer} from 'utils/interfaces.ts';
import classes from './Transformers.module.css';

export default function Transformers({transformers, canUpdate, onUpdate}: {
    transformers: AppliedTransformer[],
    canUpdate: boolean,
    onUpdate: (transformers: AppliedTransformer[]) => void
}) {
    function removeTransformer(index: number) {
        onUpdate(transformers.filter((_, idx) => idx !== index));
    }

    function updateTransformers(index: number, transformer: AppliedTransformer) {
        const newTransformers = [...transformers];
        newTransformers[index] = transformer
        onUpdate(newTransformers);
    }

    return (
        <DraggableList list={transformers} readOnly={!canUpdate} onChange={onUpdate}>
            {(transformer, idx) =>
                <Transformer key={`${transformer.name}_${idx}`}
                             transformer={transformer}
                             readOnly={!canUpdate}
                             onRemove={() => removeTransformer(idx)}
                             onUpdate={transformer => updateTransformers(idx, transformer)}/>}
        </DraggableList>
    );
}

function Transformer({transformer, readOnly, onRemove, onUpdate}: {
    transformer: AppliedTransformer,
    readOnly: boolean,
    onRemove: () => void,
    onUpdate: (transformer: AppliedTransformer) => void
}) {
    const {data: {transformers}} = useMethods();
    const transformerConfig = transformers.get(transformer.name);

    function onTransformerChange(transformer: string) {
        onUpdate({
            name: transformer,
            parameters: [...transformers.get(transformer)!.items.keys() || []].reduce<{
                [key: string]: any
            }>((acc, itemKey) => {
                acc[itemKey] = transformers.get(transformer)!.items.get(itemKey)!.default_value;
                return acc;
            }, {})
        });
    }

    function onUpdateTransformerConfig(key: string, value: any) {
        onUpdate({
            name: transformer.name,
            parameters: {
                ...transformer.parameters,
                [key]: value
            }
        });
    }

    return (
        <Form inline isDisabled={readOnly}>
            <select value={transformer.name} onChange={e => onTransformerChange(e.target.value)}>
                <option disabled value="">Select a transformer</option>
                {[...transformers.keys()].map(transformerId =>
                    <option key={transformerId} value={transformerId}>
                        {transformers.get(transformerId)!.label}
                    </option>
                )}
            </select>

            {[...transformerConfig?.items.keys() || []].map(configItemKey =>
                <ConfigurationItem key={configItemKey} isInline
                                   item={transformerConfig!.items.get(configItemKey)!}
                                   value={transformer.parameters[configItemKey]}
                                   config={transformer.parameters}
                                   onUpdate={value => onUpdateTransformerConfig(configItemKey, value)}/>)}

            {!readOnly && <button className={classes.removeBtn} title="Remove transformer" onClick={onRemove}>
                <IconTrash size="1em"/>
            </button>}
        </Form>
    );
}
