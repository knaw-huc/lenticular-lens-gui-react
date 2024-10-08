import {ReactNode} from 'react';
import {IconX} from '@tabler/icons-react';
import * as Dialog from '@radix-ui/react-dialog';
import classes from './Modal.module.css';
import clsx from 'clsx';

export default function Modal({trigger, title, onClose, fullScreenMode = false, children}: {
    trigger: ReactNode,
    title: string,
    onClose?: () => void,
    fullScreenMode?: boolean,
    children: ReactNode
}) {
    return (
        <Dialog.Root onOpenChange={open => !open && onClose && onClose()}>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>

            <Dialog.Overlay className={classes.overlay}/>

            <Dialog.Content className={clsx(classes.content, fullScreenMode && classes.fullScreen)}
                            aria-describedby={undefined}>
                <Dialog.Title className={classes.title}>
                    {title}
                </Dialog.Title>

                <Dialog.Close asChild>
                    <button className={classes.closeButton} aria-label="Close">
                        <IconX size="0.9em"/>
                    </button>
                </Dialog.Close>

                {children}
            </Dialog.Content>
        </Dialog.Root>
    );
}
