import {useCallback} from 'react';
import LogicTree from 'components/LogicTree.tsx';
import FilterCondition from 'components/shared/FilterCondition.tsx';
import useEntityTypeSelections from 'stores/useEntityTypeSelections.ts';
import {EntityTypeSelection} from 'utils/interfaces.ts';

const addFilter = () => ({type: '', property: ['']});

export default function Filter({ets, isInUse}: { ets: EntityTypeSelection, isInUse: boolean }) {
    const update = useEntityTypeSelections(state => state.update);

    const LeafComponent = useCallback((props: any) =>
        FilterCondition({...props, dataset: ets.dataset}), [ets.dataset]);

    const add = !isInUse ? addFilter : undefined;
    const onChange = !isInUse ? useCallback((changed: any) => update(ets.id, ets => ets.filter = changed), [update]) : undefined;

    return (
        <LogicTree logicTree={ets.filter}
                   elementsKey="conditions"
                   LeafComponent={LeafComponent}
                   add={add}
                   onChange={onChange}/>
    );
}
