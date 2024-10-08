import {useCallback, useState} from 'react';
import LogicTree, {FuzzyLeafComponentProps} from 'components/LogicTree.tsx';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import {useLinksets} from 'queries/linksets.ts';
import {useLenses} from 'queries/lenses.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import {lensOptions} from 'utils/logicBoxOptions.ts';
import {LensElements, LensSpec, SpecRef} from 'utils/interfaces.ts';
import {getLinksetSpecsInLens, getRecursiveGroups, updateLensLogicBoxTypes} from 'utils/specifications.ts';
import classes from './Operations.module.css';
import useViews from 'hooks/useViews.ts';

const addLens: () => SpecRef = () => ({id: -1, type: 'linkset'});
const allowFuzzyLogic = (elements: LensElements) =>
    elements.type === 'difference' || elements.type.startsWith('in_set');

export default function Operations({jobId, lensSpec, isInUse}: {
    jobId: string,
    lensSpec: LensSpec,
    isInUse: boolean
}) {
    const {linksetSpecs} = useLinksetSpecs();
    const {lensSpecs, update} = useLensSpecs();
    const {updateEts} = useViews();
    const [useFuzzyLogic, setUseFuzzyLogic] = useState(getRecursiveGroups(lensSpec.specs, 'elements')
        .find(spec => spec.s_norm !== undefined) !== undefined);

    const LeafComponent = useCallback((props: any) => LensElement({...props, jobId}), [jobId]);
    const add = !isInUse ? addLens : undefined;
    const onChange = !isInUse ? useCallback((newLogicTree: any) => {
        update(lensSpec.id, lensSpec => lensSpec.specs = newLogicTree);
        setTimeout(() => {
            const etsIds = getLinksetSpecsInLens(lensSpec.id, linksetSpecs, lensSpecs)
                .flatMap(linksetSpec => [...linksetSpec.sources, ...linksetSpec.targets]);
            updateEts(lensSpec.id, 'lens', new Set(etsIds));
        }, 0);
    }, [linksetSpecs, lensSpecs, update, updateEts]) : undefined;
    const switchFuzzyLogic = !isInUse ? useCallback((useFuzzyLogic: boolean) => {
        setUseFuzzyLogic(useFuzzyLogic);
        update(lensSpec.id, lensSpec => updateLensLogicBoxTypes(lensSpec.specs, useFuzzyLogic));
    }, [setUseFuzzyLogic, update]) : undefined;

    return (
        <LogicTree logicTree={lensSpec.specs}
                   elementsKey="elements"
                   LeafComponent={LeafComponent}
                   add={add}
                   onChange={onChange}
                   exactNumberOfElements={2}
                   useFuzzyLogic={useFuzzyLogic}
                   allowFuzzyLogic={allowFuzzyLogic}
                   switchFuzzyLogic={switchFuzzyLogic}
                   options={lensOptions}/>
    );
}

function LensElement(
    {
        parent,
        element,
        index,
        canUpdateElement,
        onUpdateElement,
        jobId
    }: FuzzyLeafComponentProps<'elements', SpecRef> & { jobId: string }) {
    const {linksetSpecs} = useLinksetSpecs();
    const {lensSpecs} = useLensSpecs();
    const {data: linksets} = useLinksets(jobId);
    const {data: lenses} = useLenses(jobId);

    const allowedLinksetSpecs = linksetSpecs.filter(linksetSpec =>
        linksets.filter(linkset =>
            linkset.spec_id === linksetSpec.id && linkset.status === 'done' && linkset.links_count > 0));
    const allowedLensSpecs = lensSpecs.filter(lensSpec =>
        lenses.filter(lens =>
            lens.spec_id === lensSpec.id && lens.status === 'done' && lens.links_count > 0));

    allowedLinksetSpecs.sort((specA, specB) => specA.label.localeCompare(specB.label));
    allowedLensSpecs.sort((specA, specB) => specA.label.localeCompare(specB.label));

    function onSpecChange(value: string) {
        const [type, id] = value.split(':');
        return canUpdateElement && onUpdateElement(elem => {
            elem.type = type === 'linkset' ? 'linkset' : 'lens';
            elem.id = parseInt(id);
        });
    }

    return (
        <fieldset className={classes.element} disabled={!canUpdateElement}>
            <select value={`${element.type}:${element.id}`} onChange={e => onSpecChange(e.target.value)}>
                <option value="linkset:-1" disabled>
                    Select a linkset or lens
                </option>

                {allowedLinksetSpecs.length > 0 && <optgroup label="Linksets">
                    {linksetSpecs.map(linksetSpec =>
                        <option key={linksetSpec.id} value={`linkset:${linksetSpec.id}`}>
                            {linksetSpec.label}
                        </option>)}
                </optgroup>}

                {allowedLensSpecs.length > 0 && <optgroup label="Lenses">
                    {lensSpecs.map(lensSpec => <option key={lensSpec.id} value={`lens:${lensSpec.id}`}>
                        {lensSpec.label}
                    </option>)}
                </optgroup>}
            </select>

            {(parent.type === 'difference' || parent.type.startsWith('in_set')) && <div className={classes.helpText}>
                {index[index.length - 1] === 0 ? 'Target' : 'Filter'}
            </div>}
        </fieldset>
    );
}
