import {createFileRoute} from '@tanstack/react-router';
import Specifications from 'components/shared/Specifications.tsx';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import {AlignmentIcon} from 'utils/icons.tsx';
import {getSpecsUsedInLenses} from 'utils/specifications.ts';

function Alignment() {
    const {jobId} = Route.useParams();
    const {linksetSpecs, addNew, duplicateById, deleteById} = useLinksetSpecs();
    const {lensSpecs} = useLensSpecs();

    function cannotDeleteCheck(id: number) {
        return getSpecsUsedInLenses(lensSpecs, linksetSpecs)
            .find(spec => spec.type === 'linkset' && spec.id === id) !== undefined;
    }

    return (
        <Specifications
            jobId={jobId}
            type="linkset"
            specifications={linksetSpecs}
            icon={<AlignmentIcon/>}
            link="/$jobId/alignment/$id"
            description="The alignment contains the alignments/linksets you will work with."
            createButtonLabel="New alignment"
            onCreate={addNew}
            onDuplicate={duplicateById}
            onDelete={deleteById}
            cannotDeleteCheck={cannotDeleteCheck}/>
    );
}

export const Route = createFileRoute('/$jobId/alignment/')({component: Alignment});
