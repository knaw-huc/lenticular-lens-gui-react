import {useState} from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import classes from './Slider.module.css';

export default function Slider({value, label, min, max, step, onChange, disabled = false, noZero = false}: {
    value: number,
    label: string,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
    disabled?: boolean,
    noZero?: boolean
}) {
    const [curValue, setCurValue] = useState([value]);

    return (
        <div className={classes.slider}>
            <RadixSlider.Root className={classes.root} value={curValue}
                              min={min} max={max} step={step} disabled={disabled}
                              onValueChange={setCurValue} onValueCommit={_ => onChange(curValue[0])}>
                <RadixSlider.Track className={classes.track}>
                    <RadixSlider.Range className={classes.range}/>
                </RadixSlider.Track>

                <RadixSlider.Thumb className={classes.thumb} aria-label={label}/>
            </RadixSlider.Root>

            <span className={classes.value}>
                {(curValue[0] === 0 && noZero) ? '-' : curValue[0]}
            </span>
        </div>
    );
}
