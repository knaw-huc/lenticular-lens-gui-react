import {ReactNode} from 'react';
import Checkbox from 'components/Checkbox.tsx';
import {ButtonGroup} from 'utils/components.tsx';

export default function RadioGroup<O extends Record<string, ReactNode>>({options, active, setActive}: {
    options: O,
    active: keyof O,
    setActive: (option: keyof O) => void
}) {
    return (
        <ButtonGroup>
            {Object.entries(options).map(([option, label]) => <Checkbox
                key={option}
                asButton
                checked={active === option}
                onCheckedChange={_ => setActive(option)}>
                {label}
            </Checkbox>)}
        </ButtonGroup>
    );
}
