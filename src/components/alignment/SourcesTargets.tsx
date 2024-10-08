import {ResultItem, Results} from 'components/Results.tsx';
import EntityTypeSelectionSelection from 'components/EntityTypeSelectionSelection.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import useViews from 'hooks/useViews.ts';
import {getRecursiveElements} from 'utils/specifications.ts';
import {LinksetSpec} from 'utils/interfaces.ts';
import {DataSetIcon} from 'utils/icons.tsx';
import classes from './SourcesTargets.module.css';

export default function SourcesTargets({linksetSpec, isInUse}: { linksetSpec: LinksetSpec, isInUse: boolean }) {
    const {update} = useLinksetSpecs();
    const {updateEts} = useViews();

    function getAdd(isSource: boolean) {
        return () => !isInUse && update(linksetSpec.id, linksetSpec =>
            (isSource ? linksetSpec.sources : linksetSpec.targets).push(-1));
    }

    function getUpdate(isSource: boolean) {
        return (index: number, etsId: number) => !isInUse && update(linksetSpec.id, linksetSpec => {
            (isSource ? linksetSpec.sources : linksetSpec.targets).splice(index, 1, etsId);
            onUpdateEts(linksetSpec, etsId, isSource, true);
        });
    }

    function getRemove(isSource: boolean) {
        return (index: number) => !isInUse && update(linksetSpec.id, linksetSpec => {
            const etsId = (isSource ? linksetSpec.sources : linksetSpec.targets)[index];
            (isSource ? linksetSpec.sources : linksetSpec.targets).splice(index, 1);
            onUpdateEts(linksetSpec, etsId, isSource, false);
        });
    }

    function onUpdateEts(linksetSpec: LinksetSpec, etsId: number, isSource: boolean, isAdded: boolean) {
        for (const condition of getRecursiveElements(linksetSpec.methods, 'conditions')) {
            const props = isSource ? condition.sources : condition.targets;

            if (isAdded && !(etsId in props.properties))
                props.properties[etsId] = [{
                    property: [''],
                    transformers: [],
                }];
            else if (!isAdded && (etsId in props.properties))
                delete props.properties[etsId];
        }

        updateEts(linksetSpec.id, 'linkset', new Set([...linksetSpec.sources, ...linksetSpec.targets]));
    }

    return (
        <fieldset disabled={isInUse}>
            <SourcesTargetsList isSources={true}
                                className={classes.sources}
                                ids={linksetSpec.sources}
                                add={getAdd(true)}
                                update={getUpdate(true)}
                                remove={getRemove(true)}/>

            <SourcesTargetsList isSources={false}
                                className={classes.targets}
                                ids={linksetSpec.targets}
                                add={getAdd(false)}
                                update={getUpdate(false)}
                                remove={getRemove(false)}/>
        </fieldset>
    );
}

function SourcesTargetsList({isSources, className, ids, add, update, remove}: {
    isSources: boolean,
    className?: string,
    ids: number[],
    add: () => void,
    update: (index: number, etsId: number) => void,
    remove: (index: number) => void,
}) {
    return (
        <div className={className}>
            <h3>{isSources ? 'Sources' : 'Targets'}</h3>

            <Results distinctLines={false}>
                {ids.map((id, index) =>
                    <SourceTarget key={id} id={id} ids={ids} index={index} update={update} remove={remove}/>)}
            </Results>

            <button onClick={add}>
                Add {isSources ? 'source' : 'target'}
            </button>
        </div>
    );
}

function SourceTarget({id, ids, index, update, remove}: {
    id: number,
    ids: number[],
    index: number,
    update: (index: number, etsId: number) => void,
    remove: (index: number) => void
}) {
    const {entityTypeSelections} = useEntityTypeSelections();
    const ets = entityTypeSelections.find(ets => ets.id === id);

    return (
        <ResultItem>
            {ets && <div>
                <DataSetIcon/>
                {ets.label}
            </div>}

            {!ets && <EntityTypeSelectionSelection value={id} disallowed={ids} onUpdate={id => update(index, id)}/>}

            <button onClick={_ => remove(index)}>
                Delete
            </button>
        </ResultItem>
    );
}
