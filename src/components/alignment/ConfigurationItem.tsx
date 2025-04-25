import Switch from 'components/Switch.tsx';
import Slider from 'components/Slider.tsx';
import TagsInput from 'components/TagsInput.tsx';
import Properties from 'components/Properties.tsx';
import EntityTypeSelectionSelection from 'components/EntityTypeSelectionSelection.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {LabelGroup} from 'utils/components.tsx';
import {
    ConfigItem,
    BooleanConfigItem,
    ChoicesConfigItem,
    NumberRangeConfigItem,
    PropertyConfigItem,
    StringTagsConfigItem,
    EntityTypeSelectionConfigItem
} from 'utils/interfaces.ts';
import classes from './ConfigurationItem.module.css';

function isStringTags(configItem: ConfigItem): configItem is StringTagsConfigItem {
    return configItem.type === 'string' || configItem.type === 'tags';
}

function isNumberRange(configItem: ConfigItem): configItem is NumberRangeConfigItem {
    return configItem.type === 'number' || configItem.type === 'range';
}

function isBoolean(configItem: ConfigItem): configItem is BooleanConfigItem {
    return configItem.type === 'boolean';
}

function isChoices(configItem: ConfigItem): configItem is ChoicesConfigItem {
    return configItem.type === 'choices';
}

function isEntityTypeSelection(configItem: ConfigItem): configItem is EntityTypeSelectionConfigItem {
    return configItem.type === 'entity_type_selection';
}

function isProperty(configItem: ConfigItem): configItem is PropertyConfigItem {
    return configItem.type === 'property';
}

export default function ConfigurationItem({item, value, config, onUpdate, isInline = false}: {
    item: ConfigItem,
    value: any,
    config: { [key: string]: any },
    onUpdate: (value: any) => void,
    isInline?: boolean
}) {
    if (item.type === 'property' && config[item.entity_type_selection_key!] === undefined)
        return undefined;

    return (
        <LabelGroup isForm label={item.label}
                    inline={isInline || item.type === 'boolean'} labelLast={item.type === 'boolean'}>
            {isBoolean(item) &&
                <BooleanField value={value} onUpdate={onUpdate}/>}

            {(isStringTags(item) || isNumberRange(item)) && ['string', 'number'].includes(item.type) &&
                <InputField item={item} value={value} isInline={isInline} onUpdate={onUpdate}/>}

            {isNumberRange(item) && item.type === 'range' &&
                <RangeField item={item} value={value} onUpdate={onUpdate}/>}

            {isChoices(item) &&
                <ChoicesField choices={item.choices} value={value} onUpdate={onUpdate}/>}

            {isStringTags(item) && item.type === 'tags' &&
                <TagsInput value={value} onChange={onUpdate}/>}

            {isEntityTypeSelection(item) &&
                <EntityTypeSelectionSelection value={value === undefined ? -1 : value} onUpdate={onUpdate}/>}

            {isProperty(item) && config[item.entity_type_selection_key] !== undefined &&
                <PropertiesField entityTypeSelection={config[item.entity_type_selection_key]}
                                 value={value} onUpdate={onUpdate}/>}
        </LabelGroup>
    );
}

function BooleanField({value, onUpdate}: { value: boolean, onUpdate: (value: boolean) => void }) {
    return <Switch checked={value} onCheckedChange={onUpdate}/>;
}

function InputField({item, value, isInline, onUpdate}: {
    item: StringTagsConfigItem | NumberRangeConfigItem,
    value: string | number,
    isInline: boolean,
    onUpdate: (value: string | number) => void
}) {
    return <input type={item.type === 'number' ? 'number' : 'text'}
                  step={item.type === 'number' ? (item.step || 1) : undefined}
                  min={item.type === 'number' ? item.min_incl_value : undefined}
                  max={item.type === 'number' ? item.max_incl_value : undefined}
                  className={isInline ? (item.size ? (item.size === 'small' ? classes.small : classes.large) : classes.medium) : undefined}
                  value={value}
                  onChange={e => onUpdate(e.target.value)}/>;
}

function RangeField({item, value, onUpdate}: {
    item: NumberRangeConfigItem,
    value: number,
    onUpdate: (value: number) => void
}) {
    return <Slider label={item.label}
                   min={item.min_incl_value || 0}
                   max={item.max_incl_value || 1}
                   step={item.step || 1}
                   value={value}
                   onChange={value => onUpdate(value)}/>;
}

function ChoicesField({choices, value, onUpdate}: {
    choices: { [choice: string]: string },
    value: string,
    onUpdate: (value: string) => void
}) {
    return (
        <select value={value} onChange={e => onUpdate(e.target.value)}>
            <option value="" disabled>Select an option</option>
            {Object.keys(choices).map(choice => <option key={choice} value={choice}>
                {choices[choice]}
            </option>)}
        </select>
    );
}

function PropertiesField({entityTypeSelection, value, onUpdate}: {
    entityTypeSelection: number,
    value: string[][],
    onUpdate: (value: string[][]) => void
}) {
    const {entityTypeSelections} = useEntityTypeSelections();
    const ets = entityTypeSelections.find(ets => ets.id === entityTypeSelection);

    return ets ? <Properties properties={value} datasetRef={ets.dataset!} onChange={onUpdate}/> : undefined;
}
