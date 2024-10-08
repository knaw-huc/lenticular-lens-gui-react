import {useState, KeyboardEvent} from 'react';
import classes from './TagsInput.module.css';

export default function TagsInput({value = [], onChange}: {
    value: string[],
    onChange: (tags: string[]) => void
}) {
    const [curTagValue, setCurTagValue] = useState('');

    function removeTag(index: number) {
        const tags = [...value];
        tags.splice(index, 1);
        onChange(tags);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (!['Enter', ' '].includes(e.key) || curTagValue.trim().length === 0)
            return;

        const newTag = curTagValue.trim();
        setCurTagValue('');
        if (!value.includes(newTag))
            onChange([...value, newTag]);
    }

    return (
        <div className={classes.tagsInput}>
            {value.map((tag, index) => <div key={index} className={classes.tag}>
                {tag}
                <span onClick={() => removeTag(index)}>&times;</span>
            </div>)}

            <input type="text" className={classes.input} value={curTagValue}
                   onChange={e => setCurTagValue(e.target.value)} onKeyDown={handleKeyDown}/>
        </div>
    )
}
