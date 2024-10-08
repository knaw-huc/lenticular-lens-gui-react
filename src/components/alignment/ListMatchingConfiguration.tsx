import {useId} from 'react';
import {Form, LabelGroup} from 'utils/components.tsx';
import {ListMatching, MatchingMethodSpec} from 'utils/interfaces.ts';
import classes from './ListMatchingConfiguration.module.css';

export default function ListMatchingConfiguration({matchMethodSpec, canUpdate, onUpdate}: {
    matchMethodSpec: MatchingMethodSpec,
    canUpdate: boolean,
    onUpdate: (updateFn: (newElement: MatchingMethodSpec) => void) => void
}) {
    const id = useId();

    function updateListMatching<P extends keyof ListMatching>(property: P, value: ListMatching[P]) {
        canUpdate && onUpdate(condition => condition.list_matching[property] = value);
    }

    return (
        <Form inline isDisabled={!canUpdate}>
            <LabelGroup isForm label="Minimum intersections" inline>
                <input type="number" step={1} className={classes.minimumIntersections}
                       value={matchMethodSpec.list_matching.threshold}
                       onChange={e => updateListMatching('threshold', parseInt(e.target.value))}/>
            </LabelGroup>

            <LabelGroup isForm label="intersections" inline labelLast>
                <input type="radio" value="false" name={'is_percentage_' + id}
                       checked={!matchMethodSpec.list_matching.is_percentage}
                       onChange={e => updateListMatching('is_percentage', Boolean(e.target.value))}/>
            </LabelGroup>

            <LabelGroup isForm label="%" inline labelLast>
                <input type="radio" value="true" name={'is_percentage_' + id}
                       checked={matchMethodSpec.list_matching.is_percentage}
                       onChange={e => updateListMatching('is_percentage', Boolean(e.target.value))}/>
            </LabelGroup>
        </Form>
    );
}
