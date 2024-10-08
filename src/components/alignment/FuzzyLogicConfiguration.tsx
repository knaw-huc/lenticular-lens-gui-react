import ThresholdSlider from 'components/ThresholdSlider.tsx';
import {Fuzzy, MatchingMethodSpec} from 'utils/interfaces.ts';
import {sNormOptions, tNormOptions} from 'utils/logicBoxOptions.ts';
import {Form, LabelGroup} from 'utils/components.tsx';

export default function FuzzyLogicConfiguration({matchMethodSpec, canUpdate, onUpdate}: {
    matchMethodSpec: MatchingMethodSpec,
    canUpdate: boolean,
    onUpdate: (updateFn: (newElement: MatchingMethodSpec) => void) => void
}) {
    function updateFuzzy<P extends keyof Fuzzy>(property: P, value: Fuzzy[P]) {
        canUpdate && onUpdate(condition => condition.fuzzy[property] = value);
    }

    return (
        <Form inline isDisabled={!canUpdate}>
            <LabelGroup isForm label="T-norm" inline>
                <select value={matchMethodSpec.fuzzy.t_norm} onChange={e => updateFuzzy('t_norm', e.target.value)}>
                    <option disabled value="">Select a t-norm</option>
                    {Object.keys(tNormOptions).map(tNormOption =>
                        <option key={tNormOption} value={tNormOption}>
                            {tNormOptions[tNormOption as keyof typeof tNormOptions].label}
                        </option>
                    )}
                </select>
            </LabelGroup>

            <LabelGroup isForm label="S-norm" inline>
                <select value={matchMethodSpec.fuzzy.s_norm} onChange={e => updateFuzzy('s_norm', e.target.value)}>
                    <option disabled value="">Select a s-norm</option>
                    {Object.keys(sNormOptions).map(sNormOption =>
                        <option key={sNormOption} value={sNormOption}>
                            {sNormOptions[sNormOption as keyof typeof sNormOptions].label}
                        </option>
                    )}
                </select>
            </LabelGroup>

            <LabelGroup isForm label="Threshold" inline>
                <ThresholdSlider value={matchMethodSpec.fuzzy.threshold} disabled={!canUpdate}
                                 onChange={value => updateFuzzy('threshold', value)}/>
            </LabelGroup>
        </Form>
    );
}
