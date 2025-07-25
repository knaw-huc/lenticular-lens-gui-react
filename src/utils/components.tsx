import {HTMLProps, ReactNode} from 'react';
import {IconX} from '@tabler/icons-react';
import clsx from 'clsx';
import classes from './components.module.css';

export function Spinner({type, className}: { type?: 'inline' | 'main', className?: string }) {
    return (
        <span className={clsx(
            classes.spinner,
            type === 'inline' && classes.spinnerInline,
            type === 'main' && classes.spinnerMain,
            className)}/>
    );
}

export function Container({className, children}: { className?: string, children: ReactNode }) {
    return (
        <div className={clsx(classes.container, className)}>
            {children}
        </div>
    );
}

export function MainTypeHeader({children, menu}: { children: ReactNode, menu?: ReactNode }) {
    return (
        <Container>
            <div className={classes.mainTypeHeader}>
                <h3>
                    {children}
                </h3>

                {menu && <div>
                    {menu}
                </div>}
            </div>
        </Container>
    );
}

export function RunStatusMenu({className, state = 'succeeded', status, children}: {
    className?: string,
    state?: 'running' | 'failed' | 'succeeded',
    status?: string,
    children?: ReactNode
}) {
    return (
        <div className={clsx(classes.runStatusMenu, className)}>
            {state === 'running' && <Spinner className={classes.runStatusRunning}/>}
            {state === 'failed' && <IconX size="2.5em" className={classes.runStatusFailed}/>}

            <div className={classes.runStatus}>
                {status && <div className={classes.runStatusMessage}>
                    <div>Status:</div>
                    {status}
                </div>}

                {children && <div>
                    {children}
                </div>}
            </div>
        </div>
    );
}

export function StickyMenu({className, children}: { className?: string, children: ReactNode }) {
    return (
        <div className={clsx(classes.stickyMenu, className)}>
            {children}
        </div>
    );
}

export function Form({className, inline = false, isDisabled = false, children}: {
    className?: string,
    inline?: boolean,
    isDisabled?: boolean,
    children: ReactNode
}) {
    return (
        <fieldset className={clsx(classes.form, inline && classes.inline, className)} disabled={isDisabled}>
            {children}
        </fieldset>
    );
}

export function ButtonGroup({className, children}: { className?: string, children: ReactNode }) {
    return (
        <div className={clsx(classes.buttonGroup, className)}>
            {children}
        </div>
    );
}

export function LabelGroup({label, className, inline = false, isForm = false, labelLast = false, children}: {
    label: ReactNode,
    className?: string,
    inline?: boolean,
    isForm?: boolean,
    labelLast?: boolean,
    children: ReactNode
}) {
    const classNames = clsx(classes.labelGroup, inline && classes.inline, className);
    const content = <>
        {labelLast && children}
        <div className={classes.label}>{label}</div>
        {!labelLast && children}
    </>;

    if (isForm)
        return <label className={classNames}>{content}</label>;

    return <div className={classNames}>{content}</div>;
}

export function Badge({className, children}: { className?: string, children: ReactNode }) {
    return (
        <span className={clsx(classes.badge, className)}>
            {children}
        </span>
    );
}

export function LinkButton({children, className, ...props}: { children: ReactNode } & HTMLProps<HTMLAnchorElement>) {
    return (
        <a className={clsx('button', className)} {...props}>
            {children}
        </a>
    );
}

export function Properties({className, children}: { className?: string, children: ReactNode }) {
    return (
        <div className={clsx(classes.properties, className)}>
            {children}
        </div>
    );
}
