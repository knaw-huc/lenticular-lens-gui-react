import {QueryClient, queryOptions, useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import useViews from 'hooks/useViews.ts';
import {Job, JobUpdateData} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

// TODO: socket informs about updates, so only stale after job change or new window?
// TODO: on fetch always compare against local changes?
const getJobQueryOptions = (id: string) => queryOptions({
    queryKey: ['job', id],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    queryFn: _ => loadJob(id)
});

export function useJob(id: string) {
    return useSuspenseQuery(getJobQueryOptions(id));
}

export async function fetchJob(queryClient: QueryClient, id: string) {
    return queryClient.fetchQuery(getJobQueryOptions(id));
}

export async function prefetchJob(queryClient: QueryClient, id: string) {
    return queryClient.prefetchQuery(getJobQueryOptions(id));
}

export function useCreateJob() {
    return useMutation({
        mutationFn: ({title, description, link}: {
            title: string,
            description: string,
            link?: string
        }) => createJob(title, description, link)
    });
}

export function useUpdateJob(id: string) {
    const queryClient = useQueryClient();
    const {data: job} = useJob(id);
    const {entityTypeSelections} = useEntityTypeSelections();
    const {linksetSpecs} = useLinksetSpecs();
    const {lensSpecs} = useLensSpecs();
    const {views} = useViews();

    return useMutation({
        mutationFn: () => updateJob({
            ...job,
            entity_type_selections: entityTypeSelections,
            linkset_specs: linksetSpecs,
            lens_specs: lensSpecs,
            views: views
        }),
        onSettled: () => queryClient.invalidateQueries(getJobQueryOptions(id))
    });
}

export function useUpdateJobMetadata(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobMetadata: {
            job_title?: string;
            job_description?: string;
            job_link?: string | null;
        }) => updateJob({job_id: id, ...jobMetadata}),
        onSettled: () => queryClient.invalidateQueries(getJobQueryOptions(id))
    });
}

export function useUpdateJobWithData() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (job: JobUpdateData) => updateJob(job),
        onSettled: (_data, _error, job) =>
            queryClient.invalidateQueries(getJobQueryOptions(job.job_id))
    });
}

export function useDeleteJob(id: string) {
    return useMutation({
        mutationFn: () => deleteJob(id),
    });
}

async function loadJob(id: string): Promise<Job> {
    const response = await fetch(`${api()}/job/${id}`);
    if (!response.ok)
        throw new Error(`Unable to fetch job with id ${id}!`);

    const job = await response.json();
    job.created_at = job.created_at ? new Date(job.created_at) : null;
    job.updated_at = job.updated_at ? new Date(job.updated_at) : null;
    return job;
}

async function createJob(title: string, description: string, link?: string): Promise<string> {
    const formData = new FormData();
    formData.append('job_title', title);
    formData.append('job_description', description);
    if (link)
        formData.append('job_link', link);

    const response = await fetch(`${api()}/job/create`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok)
        throw new Error('Unable to create a job!');

    return (await response.json()).job_id;
}

async function updateJob(job: JobUpdateData): Promise<void> {
    const response = await fetch(`${api()}/job/update`, {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(job)
    });

    if (!response.ok)
        throw new Error('Unable to save job!');
}

async function deleteJob(id: string): Promise<void> {
    const response = await fetch(`${api()}/job/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok)
        throw new Error(`Unable to delete job with id ${id}!`);
}
