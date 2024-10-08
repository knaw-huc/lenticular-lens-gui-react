import {useJob as useJobQuery} from 'queries/job.ts';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import useViews from 'hooks/useViews.ts';

export default function useJob(id: string) {
    const {data: job} = useJobQuery(id);
    const {entityTypeSelections} = useEntityTypeSelections();
    const {linksetSpecs} = useLinksetSpecs();
    const {lensSpecs} = useLensSpecs();
    const {views} = useViews();

    function hasChanges() {
        const entityTypeSelectionsHasChanges =
            JSON.stringify(entityTypeSelections) !== JSON.stringify(job.entity_type_selections);
        const linksetSpecsHasChanges = JSON.stringify(linksetSpecs) !== JSON.stringify(job.linkset_specs);
        const lensSpecsHasChanges = JSON.stringify(lensSpecs) !== JSON.stringify(job.lens_specs);
        const viewsHasChanges = JSON.stringify(views) !== JSON.stringify(job.views);

        return entityTypeSelectionsHasChanges || linksetSpecsHasChanges || lensSpecsHasChanges || viewsHasChanges;
    }

    return {hasChanges};
}
