import {IconClipboardCopy} from '@tabler/icons-react';
import classes from './Uri.module.css';

export default function Uri({uri, label = 'URI'}: { uri: string, label?: string }) {
    return (
        <div className={classes.uri}>
            <span className={classes.label}>{label}:</span>

            <a href={uri} target="_blank" rel="noreferrer">
                {uri}
            </a>

            <button className={classes.button} title="Copy URI to clipboard"
                    onClick={_ => navigator.clipboard.writeText(uri)}>
                <IconClipboardCopy size="1.1em"/>
            </button>
        </div>
    );
}
