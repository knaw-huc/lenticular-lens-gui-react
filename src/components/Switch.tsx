import * as RadixSwitch from '@radix-ui/react-switch';
import classes from './Switch.module.css';

export default function Switch({checked, required, onCheckedChange}: {
    checked?: boolean;
    required?: boolean;
    onCheckedChange?(checked: boolean): void;
}) {
    return (
        <RadixSwitch.Root className={classes.root} checked={checked} required={required}
                          onCheckedChange={onCheckedChange}>
            <RadixSwitch.Thumb className={classes.thumb}/>
        </RadixSwitch.Root>
    );
}
