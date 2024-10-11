import {useSuspenseQuery} from '@tanstack/react-query';
import {api} from 'utils/config.ts';

interface JobMetadata {
    job_id: string;
    job_title: string;
    job_description: string;
    job_link: string | null;
    created_at: Date;
    updated_at: Date;
    role: 'owner' | 'shared';
}

export function useJobs() {
    return useSuspenseQuery({
        queryKey: ['jobs'],
        queryFn: loadJobs
    });
}

async function loadJobs(): Promise<JobMetadata[]> {
    const response = await fetch(`${api}/job/list`);
    if (!response.ok)
        throw new Error('Unable to fetch all available jobs!');

    const jobs = await response.json();
    for (const job of jobs) {
        job.created_at = job.created_at ? new Date(job.created_at) : null;
        job.updated_at = job.updated_at ? new Date(job.updated_at) : null;
    }
    return jobs;
}
