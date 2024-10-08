import {useState} from 'react';
import clsx from 'clsx';
import * as Slider from '@radix-ui/react-slider';
import classes from './RangeFilter.module.css';

export default function RangeFilter({label, min, max, step, minValue, maxValue, onMinChange, onMaxChange}: {
    label: string,
    min: number,
    max: number,
    step: number,
    minValue: number,
    maxValue: number,
    onMinChange: (min: number) => void,
    onMaxChange: (min: number) => void,
}) {
    const [curMinMax, setCurMinMax] = useState([minValue, maxValue]);

    function onValueCommit(value: number[]) {
        value[0] !== minValue && onMinChange(value[0]);
        value[1] !== maxValue && onMaxChange(value[1]);
    }

    return (
        <div className={classes.group}>
            {label && <label>{label}</label>}

            <div className={clsx(classes.value, classes.min)}>{curMinMax[0].toLocaleString('en')}</div>

            <Slider.Root className={classes.root} value={curMinMax} min={min} max={max} step={step}
                         onValueChange={setCurMinMax} onValueCommit={onValueCommit}>
                <Slider.Track className={classes.track}>
                    <Slider.Range className={classes.range}/>
                </Slider.Track>

                <Slider.Thumb className={classes.thumb} aria-label={`Minimum ${label.toLowerCase()}`}/>
                <Slider.Thumb className={classes.thumb} aria-label={`Maximum ${label.toLowerCase()}`}/>
            </Slider.Root>

            <div className={clsx(classes.value, classes.max)}>{curMinMax[1].toLocaleString('en')}</div>
        </div>
    );
}
