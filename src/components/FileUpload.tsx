import {useCallback} from 'react';
import {useDropzone, Accept} from 'react-dropzone';
import classes from './FileUpload.module.css';

export default function FileUpload({description, onUpload, accept, maxFiles}: {
    description: string,
    onUpload: (files: File[]) => void,
    accept: Accept,
    maxFiles?: number
}) {
    const {open, getRootProps, getInputProps} = useDropzone({
        maxFiles,
        accept,
        onDrop: useCallback((acceptedFiles: File[]) => onUpload(acceptedFiles), [onUpload]),
    });

    return (
        <div className={classes.dropzone} {...getRootProps()}>
            <input {...getInputProps()}/>
            <span>{description}</span>
            <button type="button" onClick={open}>
                Select {!maxFiles || maxFiles > 1 ? 'files' : 'file'}
            </button>
        </div>
    );
}
