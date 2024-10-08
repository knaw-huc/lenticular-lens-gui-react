import {FunctionComponent, useCallback} from 'react';
import {
    LogicBox,
    LeafComponentProps,
    TreeComponentProps,
    LeafPlaceholderComponentProps
} from '@knaw-huc/logicbox-react';
import Checkbox from 'components/Checkbox.tsx';
import ThresholdSlider from 'components/ThresholdSlider.tsx';
import {Form, LabelGroup} from 'utils/components.tsx';
import {LogicTree as LogicTreeType} from 'utils/interfaces.ts';
import classes from './LogicTree.module.css';

export interface FuzzyLeafComponentProps<K extends string, E extends object, P extends {} = {}> extends LeafComponentProps<K, E, P> {
    useFuzzyLogic?: boolean;
}

export interface FuzzyTreeComponentProps<K extends string, E extends object, P extends {} = {}> extends TreeComponentProps<K, E, P> {
    useFuzzyLogic?: boolean;
    allowFuzzyLogic?: boolean;
    switchFuzzyLogic?: (useFuzzyLogic: boolean) => void;
}

const checkAllowFuzzyLogic = <K extends string, E extends object, P extends {} = {}>
(allowFuzzyLogic: undefined | boolean | ((logicTree: LogicTreeType<K, E, P>) => boolean), logicTree: LogicTreeType<K, E, P>) =>
    typeof allowFuzzyLogic === 'boolean' ? allowFuzzyLogic : (allowFuzzyLogic && allowFuzzyLogic(logicTree));

export default function LogicTree<K extends string, E extends object, P extends {} = {}>(
    {
        logicTree,
        elementsKey,
        LeafComponent,
        LeafPlaceholderComponent,
        add,
        onChange,
        exactNumberOfElements,
        useFuzzyLogic,
        allowFuzzyLogic,
        switchFuzzyLogic,
        options
    }: {
        logicTree: LogicTreeType<K, E, P>;
        elementsKey: K;
        LeafComponent: FunctionComponent<FuzzyLeafComponentProps<K, E, P>>;
        LeafPlaceholderComponent?: FunctionComponent<LeafPlaceholderComponentProps<K, E, P>>;
        add?: () => E;
        onChange?: (newLogicTree: LogicTreeType<K, E, P>, prevLogicTree: LogicTreeType<K, E, P>) => void;
        exactNumberOfElements?: number;
        useFuzzyLogic?: boolean;
        allowFuzzyLogic?: boolean | ((logicTree: LogicTreeType<K, E, P>) => boolean);
        switchFuzzyLogic?: (useFuzzyLogic: boolean) => void;
        options?: {
            [type: string]: {
                label: string;
                shortLabel: string;
                description?: string;
                group?: string;
            }
        };
    }) {

    const LeafComponentWithCallback = useCallback<FunctionComponent<LeafComponentProps<K, E, P>>>(
        props => LeafComponent({...props, useFuzzyLogic}), [useFuzzyLogic]);
    const TreeComponentWithCallback = useCallback<FunctionComponent<TreeComponentProps<K, E, P>>>(
        props => TreeComponent({
            ...props,
            useFuzzyLogic,
            allowFuzzyLogic: checkAllowFuzzyLogic(allowFuzzyLogic, props.logicBox),
            switchFuzzyLogic
        }), [useFuzzyLogic, allowFuzzyLogic, switchFuzzyLogic]);

    return (
        <LogicBox logicBox={logicTree}
                  elementsKey={elementsKey}
                  className={classes.logicTree}
                  options={options}
                  LeafComponent={LeafComponentWithCallback}
                  TreeComponent={TreeComponentWithCallback}
                  LeafPlaceholderComponent={LeafPlaceholderComponent}
                  add={add}
                  onChange={onChange}
                  exactNumberOfElements={exactNumberOfElements}/>
    );
}

function TreeComponent<K extends string, E extends object, P extends { threshold?: number }>(
    {
        logicBox,
        elementsKey,
        index,
        showOptions,
        selectBox,
        onUpdate,
        useFuzzyLogic,
        allowFuzzyLogic,
        switchFuzzyLogic
    }: FuzzyTreeComponentProps<K, E, P>) {
    function updateThreshold(threshold: number) {
        useFuzzyLogic !== undefined && switchFuzzyLogic &&
        onUpdate(logicBox => logicBox.threshold = threshold || undefined);
    }

    return (
        <div className={classes.headerMenu}>
            {showOptions && selectBox}

            {!showOptions && <span className={classes.noConditions}>
                No conditions
            </span>}

            {useFuzzyLogic !== undefined && logicBox[elementsKey].length > 0 && <Form inline>
                {useFuzzyLogic && allowFuzzyLogic && <LabelGroup isForm label="Threshold" inline>
                    <ThresholdSlider noZero disabled={!switchFuzzyLogic}
                                     value={logicBox.threshold || 0} onChange={updateThreshold}/>
                </LabelGroup>}

                {index.length === 0 && <Checkbox asButton disabled={!switchFuzzyLogic}
                                                 checked={useFuzzyLogic} onCheckedChange={switchFuzzyLogic}>
                    Use fuzzy logic
                </Checkbox>}
            </Form>}
        </div>
    );
}
