import {ReactNode} from 'react';
import clsx from 'clsx';
import classes from './Results.module.css';

export function Results({distinctLines = true, className, children}: {
    distinctLines?: boolean,
    className?: string,
    children: ReactNode
}) {
    return (
        <ul className={clsx(classes.results, distinctLines && classes.distinctLines, className)}>
            {children}
        </ul>
    );
}

export function ResultItem({isSelected = false, className, onClick, children}: {
    isSelected?: boolean,
    className?: string,
    onClick?: () => void,
    children: ReactNode
}) {
    return (
        <li onClick={onClick}
            className={clsx(isSelected && classes.selected, onClick && classes.canSelect, className)}>
            {children}
        </li>
    );
}
