import {ReactNode} from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import classes from './Checkbox.module.css';

export default function Checkbox({checked, disabled = false, onCheckedChange, asButton = false, children}: {
    checked?: boolean,
    disabled?: boolean,
    onCheckedChange?: (checked: boolean) => void,
    asButton?: boolean,
    children?: ReactNode
}) {
    return (
        <RadixCheckbox.Root className={!asButton ? classes.checkbox : undefined}
                            disabled={disabled} checked={checked} onCheckedChange={onCheckedChange}>
            <div className={asButton ? classes.checkbox : undefined}>
                <RadixCheckbox.Indicator className={classes.indicator}>
                    ✔
                </RadixCheckbox.Indicator>
            </div>

            {children}
        </RadixCheckbox.Root>
    );
}
