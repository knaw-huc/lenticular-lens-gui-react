import {createFileRoute} from '@tanstack/react-router';
import Specifications from 'components/shared/Specifications.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import {useLinksets} from 'queries/linksets.ts';
import {DataSetIcon} from 'utils/icons.tsx';
import {isEntityTypeUsedInLinkset} from 'utils/specifications.ts';

function DataSelection() {
    const {jobId} = Route.useParams();
    const {entityTypeSelections, addNew, duplicateById, deleteById} = useEntityTypeSelections();
    const {linksetSpecs} = useLinksetSpecs();
    const {data: linksets} = useLinksets(jobId);

    function cannotDeleteCheck(id: number) {
        return isEntityTypeUsedInLinkset(id, linksetSpecs, linksets);
    }

    return (
        <Specifications
            jobId={jobId}
            type="ets"
            specifications={entityTypeSelections}
            icon={<DataSetIcon/>}
            link="/$jobId/data-selection/$id"
            description={<>
                The data selection contains the selections of datasets you will work with. <br/>
                They can be entities with filters on them.
            </>}
            createButtonLabel="New data selection"
            onCreate={addNew}
            onDuplicate={duplicateById}
            onDelete={deleteById}
            cannotDeleteCheck={cannotDeleteCheck}/>
    );
}

export const Route = createFileRoute('/$jobId/data-selection/')({component: DataSelection});
