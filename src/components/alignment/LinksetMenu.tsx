import {IconAutomation, IconDeviceFloppy, IconProgress} from '@tabler/icons-react';
import Checkbox from 'components/Checkbox.tsx';
import useJob from 'hooks/useJob.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import {runLinkset, useLinksets} from 'queries/linksets.ts';
import {runClustering, useClusterings} from 'queries/clusterings.ts';
import {useUpdateJob} from 'queries/job.ts';
import {ButtonGroup} from 'utils/components.tsx';
import {LinksetSpec} from 'utils/interfaces.ts';

export default function LinksetMenu({jobId, linksetSpec}: { jobId: string, linksetSpec: LinksetSpec }) {
    const {hasChanges} = useJob(jobId);
    const mutation = useUpdateJob(jobId);
    const {update} = useLinksetSpecs();
    const {data: linksets} = useLinksets(jobId);
    const {data: clusterings} = useClusterings(jobId);

    const linkset = linksets.find(linkset => linkset.spec_id === linksetSpec.id);
    const clustering = clusterings.find(clustering => clustering.spec_type === 'linkset' && clustering.spec_id === linksetSpec.id);

    function onUpdateShowMatchingProgress(checked: boolean) {
        update(linksetSpec.id, newLinksetSpec => newLinksetSpec.use_counter = checked);
    }

    async function saveAndRun(force: boolean = false) {
        save();
        const result = await runLinkset(jobId, linksetSpec.id, force);
        if (result === 'exists' && confirm('This linkset already exists.\nDo you want to overwrite it with the current configuration?'))
            saveAndRun(true);
    }

    function save() {
        if (hasChanges())
            mutation.mutate();
    }

    function runLinksetClustering() {
        runClustering(jobId, 'linkset', linksetSpec.id);
    }

    return (
        <ButtonGroup>
            {!linkset && <Checkbox asButton checked={linksetSpec.use_counter}
                                   onCheckedChange={onUpdateShowMatchingProgress}>
                <IconProgress size="1.3em"/>
                Show matching progress
            </Checkbox>}

            {!linkset && <button onClick={_ => saveAndRun()}>
                <IconAutomation size="1.3em"/>
                Save and run
            </button>}

            {linkset?.status === 'done' && !clustering && <button onClick={runLinksetClustering}>
                <IconAutomation size="1.3em"/>
                Run clustering
            </button>}

            <button onClick={save} disabled={!hasChanges()}>
                <IconDeviceFloppy size="1.3em"/>
                Save
            </button>
        </ButtonGroup>
    );
}
