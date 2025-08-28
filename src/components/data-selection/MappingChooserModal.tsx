import {useState} from 'react';
import Modal from 'components/Modal.tsx';
import FileUpload from 'components/FileUpload.tsx';
import RadioGroup from 'components/RadioGroup.tsx';
import {addMapping} from 'queries/mapping.ts';
import {Mapping} from 'utils/interfaces.ts';
import {Form, LabelGroup} from 'utils/components.tsx';
import classes from './MappingChooserModal.module.css';

export default function MappingChooserModal({updateMapping}: {
    updateMapping: (mapping: Mapping) => void
}) {
    const [method, setMethod] = useState<'url' | 'file'>('url');
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    async function setMapping() {
        if (method === 'url' && url) {
            await addMapping(url);
            updateMapping({type: 'jsonld', url});
        }

        if (method === 'file' && selectedFile) {
            const mappingId = await addMapping(undefined, selectedFile);
            updateMapping({
                type: 'jsonld', file: {
                    id: mappingId,
                    name: selectedFile.name
                }
            });
        }
    }

    return (
        <Modal title="Add mapping" onClose={setMapping} trigger={<button title="Add mapping">Add mapping</button>}>
            <MappingChooser method={method} setMethod={setMethod}
                            url={url} setUrl={setUrl} setSelectedFile={setSelectedFile}/>
        </Modal>
    );
}

function MappingChooser({method, setMethod, url, setUrl, setSelectedFile}: {
    method: 'url' | 'file',
    setMethod: (method: 'url' | 'file') => void,
    url: string,
    setUrl: (url: string) => void,
    setSelectedFile: (file: File | null) => void,
}) {
    return (
        <Form className={classes.mappingChooser}>
            <LabelGroup inline={true} label="JSON-LD context">
                <RadioGroup options={{'url': 'Specify URL', 'file': 'Upload file'}}
                            active={method} setActive={method => setMethod(method)}/>
            </LabelGroup>

            {method === 'url' && <LabelGroup isForm label="JSON-LD context URL">
                <input name="url" value={url} onChange={e => setUrl(e.target.value)}/>
            </LabelGroup>}

            {method === 'file' && <FileUpload description="Drop a JSON-LD context here" accept={{
                'application/json': ['.json', '.jsonld'],
                'application/ld+json': ['.json', '.jsonld']
            }} maxFiles={1} onUpload={files => setSelectedFile(files[0])}/>}
        </Form>
    );
}
