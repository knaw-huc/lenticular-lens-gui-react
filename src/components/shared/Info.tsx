import {BasicMetadata} from 'utils/interfaces.ts';
import {Form, LabelGroup} from 'utils/components.tsx';

export default function Info({metadata, withUpdate, isDisabled = false}: {
    metadata: BasicMetadata,
    withUpdate: (newMetadata: BasicMetadata) => void,
    isDisabled?: boolean
}) {
    function onUpdate(type: keyof BasicMetadata, value: string) {
        withUpdate({...metadata, [type]: value});
    }

    return (
        <Form isDisabled={isDisabled}>
            <LabelGroup isForm label="Name">
                <input type="text" name="name" value={metadata.label}
                       onChange={e => onUpdate('label', e.target.value)}/>
            </LabelGroup>

            <LabelGroup isForm label="Description">
                <textarea name="description" value={metadata.description}
                          onChange={e => onUpdate('description', e.target.value)}/>
            </LabelGroup>
        </Form>
    );
}
