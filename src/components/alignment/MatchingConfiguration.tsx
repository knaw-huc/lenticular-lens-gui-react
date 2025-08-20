import {ReactNode, useCallback, useState} from 'react';
import Tabs from 'components/Tabs.tsx';
import LogicTree, {FuzzyLeafComponentProps} from 'components/LogicTree.tsx';
import MatchingMethodConfiguration from 'components/alignment/MatchingMethodConfiguration.tsx';
import ListMatchingConfiguration from 'components/alignment/ListMatchingConfiguration.tsx';
import FuzzyLogicConfiguration from 'components/alignment/FuzzyLogicConfiguration.tsx';
import SourceTargetConfiguration from 'components/alignment/SourceTargetConfiguration.tsx';
import useLinksetSpecs from 'stores/useLinksetSpecs.ts';
import {useMethods} from 'queries/methods.ts';
import {defaultOptions, fuzzyOptions} from 'utils/logicBoxOptions.ts';
import {Conditions, LinksetSpec, MatchingMethodSpec} from 'utils/interfaces.ts';
import {createNewMatchingCondition, updateMethodsLogicBoxTypes} from 'utils/specifications.ts';
import classes from './MatchingConfiguration.module.css';

export default function MatchingConfiguration({linksetSpec, isInUse}: { linksetSpec: LinksetSpec, isInUse: boolean }) {
    const update = useLinksetSpecs(state => state.update);
    const useFuzzyLogic = !['and', 'or'].includes(linksetSpec.methods.type);

    const add = useCallback(() =>
        createNewMatchingCondition(linksetSpec.sources, linksetSpec.targets), [linksetSpec.sources, linksetSpec.targets]);
    const onChange = useCallback((newLogicTree: any) =>
        update(linksetSpec.id, linksetSpec => linksetSpec.methods = newLogicTree), [update]);
    const switchFuzzyLogic = useCallback((useFuzzyLogic: boolean) =>
        update(linksetSpec.id, linksetSpec => updateMethodsLogicBoxTypes(linksetSpec.methods, useFuzzyLogic)), [update]);

    return (
        <LogicTree logicTree={linksetSpec.methods}
                   elementsKey="conditions"
                   LeafComponent={MatchingMethodSpecification}
                   add={!isInUse ? add : undefined}
                   onChange={!isInUse ? onChange : undefined}
                   switchFuzzyLogic={!isInUse ? switchFuzzyLogic : undefined}
                   useFuzzyLogic={useFuzzyLogic}
                   allowFuzzyLogic={useFuzzyLogic}
                   options={useFuzzyLogic ? fuzzyOptions : defaultOptions}/>
    );
}

function MatchingMethodSpecification({isCollapsed, element, canUpdateElement, onUpdateElement, useFuzzyLogic}:
                                     FuzzyLeafComponentProps<'conditions', MatchingMethodSpec>) {
    const {data} = useMethods();
    const methods = data.matching_methods;
    const method = methods.get(element.method.name);

    const [tab, setTab] = useState('matching-method');
    const tabs: { [key: string]: { title: ReactNode, content: ReactNode } } = {};

    function onSourceUpdate<P extends keyof Conditions>(prop: P, value: Conditions[P]) {
        return canUpdateElement && onUpdateElement(elem => elem.sources[prop] = value);
    }

    function onTargetUpdate<P extends keyof Conditions>(prop: P, value: Conditions[P]) {
        return canUpdateElement && onUpdateElement(elem => elem.targets[prop] = value);
    }

    tabs['matching-method'] = {
        title: 'Matching method',
        content: <MatchingMethodConfiguration methods={methods} matchMethodSpec={element}
                                              canUpdate={canUpdateElement} onUpdate={onUpdateElement}
                                              isSimilarity={false}/>
    };

    if (method?.type === 'normalizer')
        tabs['similarity-matching'] = {
            title: 'Similarity matching',
            content: <MatchingMethodConfiguration methods={methods} matchMethodSpec={element}
                                                  canUpdate={canUpdateElement} onUpdate={onUpdateElement}
                                                  isSimilarity={true}/>
        };

    tabs['list-matching'] = {
        title: 'List matching',
        content: <ListMatchingConfiguration matchMethodSpec={element}
                                            canUpdate={canUpdateElement} onUpdate={onUpdateElement}/>
    };

    if (useFuzzyLogic)
        tabs['fuzzy-logic'] = {
            title: 'Fuzzy logic',
            content: <FuzzyLogicConfiguration matchMethodSpec={element}
                                              canUpdate={canUpdateElement} onUpdate={onUpdateElement}/>
        };

    return (
        <div className={classes.matchingConfiguration}>
            {!isCollapsed && <Tabs tabs={tabs} defaultValue={tab} onTabChange={setTab} childTheme/>}

            <SourceTargetConfiguration isSource={true} conditions={element.sources}
                                       canUpdate={canUpdateElement} onUpdate={onSourceUpdate}/>
            <SourceTargetConfiguration isSource={false} conditions={element.targets}
                                       canUpdate={canUpdateElement} onUpdate={onTargetUpdate}/>
        </div>
    );
}
