import {IconDeviceFloppy} from '@tabler/icons-react';
import useJob from 'hooks/useJob.ts';
import {useUpdateJob} from 'queries/job.ts';

export default function EntityTypeSelectionMenu({jobId}: { jobId: string }) {
    const {hasChanges} = useJob(jobId);
    const mutation = useUpdateJob(jobId);

    function save() {
        if (hasChanges())
            mutation.mutate();
    }

    return (
        <button onClick={save} disabled={!hasChanges()}>
            <IconDeviceFloppy size="1.3em"/>
            Save
        </button>
    );
}
