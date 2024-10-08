import Slider from 'components/Slider.tsx';

export default function ThresholdSlider({value, onChange, disabled = false, noZero = false}: {
    value: number,
    onChange: (value: number) => void,
    disabled: boolean,
    noZero?: boolean
}) {
    return (
        <Slider value={value} min={0} max={1} step={0.05} label="Threshold"
                onChange={onChange} disabled={disabled} noZero={noZero}/>
    );
}
