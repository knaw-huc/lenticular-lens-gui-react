import {ReactNode} from 'react';
import {LeafComponentProps} from '@knaw-huc/logicbox-react';
import Property from 'components/Property.tsx';
import {useMethods} from 'queries/methods.ts';
import {Form, LabelGroup} from 'utils/components.tsx';
import {DatasetRef, FilterCondition as Condition, FilterFunction} from 'utils/interfaces.ts';
import classes from './FilterCondition.module.css';

export default function FilterCondition(
    {
        isCollapsed,
        element,
        canUpdateElement,
        onUpdateElement,
        dataset
    }: LeafComponentProps<'conditions', Condition, {}> & {
        dataset: DatasetRef
    }) {
    return (
        <Form isDisabled={!canUpdateElement}>
            <Property property={element.property}
                      datasetRef={dataset}
                      readOnly={!canUpdateElement}
                      onChange={newProperty => onUpdateElement(newElement => newElement.property = newProperty)}/>

            {!isCollapsed && <FilterConfiguration condition={element} onUpdateElement={onUpdateElement}/>}
        </Form>
    );
}

function FilterConfiguration({condition, onUpdateElement}: {
    condition: Condition,
    onUpdateElement: (updateFn: (newElement: Condition) => void) => void
}) {
    const {data} = useMethods();
    const filters = data.filter_functions;
    const selectedFilter = filters.get(condition.type);

    return (
        <Form inline>
            <FilterSelection filters={filters} filter={condition.type}
                             onChange={filter => onUpdateElement(condition => condition.type = filter)}/>

            {selectedFilter && selectedFilter.type &&
                <FilterConfigurationInputTypes filter={selectedFilter} condition={condition}
                                               onUpdateElement={onUpdateElement}/>}
        </Form>
    );
}

function FilterSelection({filters, filter, onChange}: {
    filters: Map<string, FilterFunction>, filter: string,
    onChange: (newFilter: string) => void
}) {
    return (
        <LabelGroup label="Filter type">
            <select value={filter} onChange={e => onChange(e.target.value)}>
                <option value="" disabled>
                    Choose a filter type
                </option>

                {[...filters.keys()].map(filterId =>
                    <option key={filterId} value={filterId}>
                        {filters.get(filterId)!.label}
                    </option>
                )}
            </select>
        </LabelGroup>
    );
}

function FilterConfigurationInputTypes({filter, condition, onUpdateElement}: {
    filter: FilterFunction,
    condition: Condition,
    onUpdateElement: (updateFn: (newElement: Condition) => void) => void
}) {
    return (
        <>
            {['string', 'date', 'number'].includes(filter.type!) &&
                <LabelGroup isForm label="Value" className={classes.filterValue}>
                    <input type={['string', 'date'].includes(filter.type!) ? 'text' : 'number'}
                           placeholder="Enter a value"
                           value={condition.value}
                           onChange={e => onUpdateElement(condition => condition.value = e.target.value)}/>

                    {filter.help_text && <HelpText>{filter.help_text}</HelpText>}
                </LabelGroup>}

            {filter.type === 'date' && <LabelGroup isForm label="Date format">
                <input type="text" placeholder="YYYY-MM-DD" value={condition.value}
                       onChange={e => onUpdateElement(condition => condition.format = e.target.value)}/>
            </LabelGroup>}
        </>
    );
}

function HelpText({children}: { children: ReactNode }) {
    return (
        <span className={classes.helpText}>
            {children}
        </span>
    );
}
