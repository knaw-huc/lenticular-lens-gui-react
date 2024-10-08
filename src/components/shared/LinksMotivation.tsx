import {FunctionComponent, useState} from 'react';
import {PopoverCloseProps} from '@radix-ui/react-popover';
import classes from './LinksMotivation.module.css';

export default function LinksMotivation({value, onSave, CloseButton}: {
    value?: string | null,
    onSave: (motivation: string) => void,
    CloseButton: FunctionComponent<PopoverCloseProps>
}) {
    const [motivation, setMotivation] = useState(value || '');

    return (
        <div className={classes.motivation}>
            <textarea value={motivation} onChange={e => setMotivation(e.target.value)}/>

            <div className={classes.buttons}>
                <CloseButton>Close</CloseButton>
                <CloseButton onClick={_ => onSave(motivation.trim())}>Save</CloseButton>
            </div>
        </div>
    );
}
