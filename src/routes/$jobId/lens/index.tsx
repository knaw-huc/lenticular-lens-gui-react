import {createFileRoute} from '@tanstack/react-router';
import Specifications from 'components/shared/Specifications.tsx';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import {LensIcon} from 'utils/icons.tsx';
import {getSpecsUsedInLenses} from 'utils/specifications.ts';

function Lens() {
    const {jobId} = Route.useParams();
    const {linksetSpecs} = useLinksetSpecs();
    const {lensSpecs, addNew, duplicateById, deleteById} = useLensSpecs();

    function cannotDeleteCheck(id: number) {
        return getSpecsUsedInLenses(lensSpecs, linksetSpecs)
            .find(spec => spec.type === 'lens' && spec.id === id) !== undefined;
    }

    return (
        <Specifications
            jobId={jobId}
            type="lens"
            specifications={lensSpecs}
            icon={<LensIcon/>}
            link="/$jobId/lens/$id"
            description="Apply a lens over the alignments/linksets or other lenses you will work with."
            createButtonLabel="New lens"
            onCreate={addNew}
            onDuplicate={duplicateById}
            onDelete={deleteById}
            cannotDeleteCheck={cannotDeleteCheck}/>
    );
}

export const Route = createFileRoute('/$jobId/lens/')({component: Lens});
