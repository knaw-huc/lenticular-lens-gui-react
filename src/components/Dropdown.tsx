import {FunctionComponent, ReactNode, useState} from 'react';
import * as Popover from '@radix-ui/react-popover';
import {IconCaretDownFilled, IconCaretUpFilled} from '@tabler/icons-react';
import classes from './Dropdown.module.css';

export default function Dropdown({trigger, children, className}: {
    trigger: ReactNode,
    children: ReactNode | ((CloseButton: FunctionComponent<Popover.PopoverCloseProps>) => ReactNode),
    className?: string
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover.Root open={isOpen} onOpenChange={open => setIsOpen(open)}>
            <Popover.Trigger asChild>
                <button className={className}>
                    {trigger}
                    {isOpen ? <IconCaretUpFilled size="1.3em"/> : <IconCaretDownFilled size="1.3em"/>}
                </button>
            </Popover.Trigger>

            <Popover.Content className={classes.dropdown}>
                <Popover.Arrow className={classes.popoverArrow}/>
                {typeof children === 'function' ? children(Popover.Close) : children}
            </Popover.Content>
        </Popover.Root>
    );
}
