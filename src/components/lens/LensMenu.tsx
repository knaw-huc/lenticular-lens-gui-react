import {IconAutomation, IconDeviceFloppy} from '@tabler/icons-react';
import useJob from 'hooks/useJob.ts';
import {runLens, useLenses} from 'queries/lenses.ts';
import {runClustering, useClusterings} from 'queries/clusterings.ts';
import {useUpdateJob} from 'queries/job.ts';
import {LensSpec} from 'utils/interfaces.ts';
import {ButtonGroup} from 'utils/components.tsx';

export default function LensMenu({jobId, lensSpec}: { jobId: string, lensSpec: LensSpec }) {
    const {hasChanges} = useJob(jobId);
    const mutation = useUpdateJob(jobId);
    const {data: lenses} = useLenses(jobId);
    const {data: clusterings} = useClusterings(jobId);

    const lens = lenses.find(lenses => lenses.spec_id === lensSpec.id);
    const clustering = clusterings.find(clustering => clustering.spec_type === 'lens' && clustering.spec_id === lensSpec.id);

    async function saveAndRun(force: boolean = false) {
        save();
        const result = await runLens(jobId, lensSpec.id, force);
        if (result === 'exists' && confirm('This lens already exists.\nDo you want to overwrite it with the current configuration?'))
            saveAndRun(true);
    }

    function save() {
        if (hasChanges())
            mutation.mutate();
    }

    function runLensClustering() {
        runClustering(jobId, 'lens', lensSpec.id);
    }

    return (
        <ButtonGroup>
            {!lens && <button onClick={_ => saveAndRun()}>
                <IconAutomation size="1.3em"/>
                Save and run
            </button>}

            {lens?.status === 'done' && !clustering && <button onClick={runLensClustering}>
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
