import {useJob as useJobQuery} from 'queries/job.ts';
import useEntityTypeSelections from 'stores/useEntityTypeSelections.ts';
import useLinksetSpecs from 'stores/useLinksetSpecs.ts';
import useLensSpecs from 'stores/useLensSpecs.ts';
import useViews from 'stores/useViews.ts';

export default function useJob(id: string) {
    const {data: job} = useJobQuery(id);
    const entityTypeSelections = useEntityTypeSelections(state => state.entityTypeSelections);
    const linksetSpecs = useLinksetSpecs(state => state.linksetSpecs);
    const lensSpecs = useLensSpecs(state => state.lensSpecs);
    const views = useViews(state => state.views);

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
