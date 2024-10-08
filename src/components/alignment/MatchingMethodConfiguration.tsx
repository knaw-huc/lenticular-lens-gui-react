import Switch from 'components/Switch.tsx';
import ConfigurationItem from 'components/alignment/ConfigurationItem.tsx';
import {MatchingMethod, MatchingMethodSpec} from 'utils/interfaces.ts';
import {Form, LabelGroup} from 'utils/components.tsx';

export default function MatchingMethodConfiguration({methods, matchMethodSpec, canUpdate, onUpdate, isSimilarity}: {
    methods: Map<string, MatchingMethod>,
    matchMethodSpec: MatchingMethodSpec,
    canUpdate: boolean,
    onUpdate: (updateFn: (newElement: MatchingMethodSpec) => void) => void,
    isSimilarity: boolean
}) {
    const matchMethod = isSimilarity ? matchMethodSpec.sim_method : matchMethodSpec.method;
    const method = matchMethod.name ? methods.get(matchMethod.name) : null;

    function onChangeMethod(name: string) {
        onUpdate(condition => {
            const method = methods.get(name);
            const methodToUpdate = isSimilarity ? condition.sim_method : condition.method;

            methodToUpdate.name = name;
            methodToUpdate.config = [...method?.items.keys() || []].reduce<{ [key: string]: any }>((acc, itemKey) => {
                acc[itemKey] = method!.items.get(itemKey)!.default_value;
                return acc;
            }, {});

            if (!isSimilarity) {
                condition.sim_method.name = null;
                condition.sim_method.config = {};
            }
        });
    }

    function onUpdateMethodConfig(key: string, value: any) {
        onUpdate(condition => {
            const configToUpdate = isSimilarity ? condition.sim_method.config : condition.method.config;
            configToUpdate[key] = value;
        });
    }

    return (
        <Form isDisabled={!canUpdate}>
            <LabelGroup isForm label={(isSimilarity ? 'Similarity' : 'Matching') + ' method'}>
                <MatchingMethodSelection methods={methods}
                                         method={matchMethod.name}
                                         onlySimilarity={isSimilarity}
                                         onChange={onChangeMethod}/>
            </LabelGroup>

            {isSimilarity && <LabelGroup isForm label="Apply similarity method on normalized value" inline labelLast>
                <Switch checked={matchMethodSpec.sim_method.normalized}
                        onCheckedChange={checked => onUpdate(condition => condition.sim_method.normalized = checked)}/>
            </LabelGroup>}

            {[...method?.items.keys() || []].map(configItemKey =>
                <ConfigurationItem key={configItemKey}
                                   item={method!.items.get(configItemKey)!}
                                   value={matchMethod.config[configItemKey]}
                                   config={matchMethod.config}
                                   onUpdate={value => onUpdateMethodConfig(configItemKey, value)}/>)}
        </Form>
    );
}

function MatchingMethodSelection({methods, method, onChange, onlySimilarity = false}: {
    methods: Map<string, MatchingMethod>,
    method: string | null,
    onChange: (newMethod: string) => void,
    onlySimilarity?: boolean
}) {
    const allowedMethods = Array.from(methods.keys())
        .filter(key => !onlySimilarity || methods.get(key)!.type === 'similarity')
        .reduce((obj, key) => {
            obj.set(key, methods.get(key));
            return obj;
        }, new Map());

    return (
        <select value={method || ''} onChange={e => onChange(e.target.value)}>
            <option value="" disabled>
                Choose a {onlySimilarity ? 'similarity' : 'matching'} method
            </option>

            {[...allowedMethods.keys()].map(methodId =>
                <option key={methodId} value={methodId}>
                    {allowedMethods.get(methodId)!.label}
                </option>
            )}
        </select>
    );
}
