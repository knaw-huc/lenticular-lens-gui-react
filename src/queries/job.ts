import {QueryClient, queryOptions, useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import useLensSpecs from 'hooks/useLensSpecs.ts';
import useViews from 'hooks/useViews.ts';
import {api} from 'utils/config.ts';
import {mergeSpecs} from 'utils/specifications.ts';
import {Job, JobUpdate, JobUpdateData, UnsavedData} from 'utils/interfaces.ts';

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
        onMutate: () => queryClient.setQueryData<Job>(['job', id], job => job ? {
            ...job,
            entity_type_selections: entityTypeSelections,
            linkset_specs: linksetSpecs,
            lens_specs: lensSpecs,
            views: views
        } : undefined)
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
        onSuccess: (_data, variables) => {
            queryClient.setQueryData<Job>(['job', id], job => job ? {
                ...job,
                ...variables
            } : undefined)
        }
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

export async function onJobUpdate(queryClient: QueryClient, data: JobUpdate, unsavedData: UnsavedData,
                                  updateUnsavedData: (unsavedData: UnsavedData) => void): Promise<void> {
    const prevJob = queryClient.getQueryData<Job>(['job', data.job_id]);
    if (!prevJob || prevJob.updated_at >= data.updated_at)
        return;

    await queryClient.cancelQueries({queryKey: ['job', data.job_id]});

    const hasUnsavedEntityTypeSelections =
        JSON.stringify(unsavedData.entityTypeSelections) !== JSON.stringify(prevJob.entity_type_selections);
    const hasUnsavedLinksetSpecs = JSON.stringify(unsavedData.linksetSpecs) !== JSON.stringify(prevJob.linkset_specs);
    const hasUnsavedLensSpecs = JSON.stringify(unsavedData.lensSpecs) !== JSON.stringify(prevJob.lens_specs);
    const hasUnsavedViews = JSON.stringify(unsavedData.views) !== JSON.stringify(prevJob.views);

    await queryClient.refetchQueries({queryKey: ['job', data.job_id]});
    const newJob = queryClient.getQueryData<Job>(['job', data.job_id]);
    if (newJob) {
        const entityTypeSelections = mergeSpecs(
            data.is_entity_type_selections_update, hasUnsavedEntityTypeSelections, prevJob.entity_type_selections,
            newJob.entity_type_selections, unsavedData.entityTypeSelections);

        const linksetSpecs = mergeSpecs(
            data.is_linkset_specs_update, hasUnsavedLinksetSpecs, prevJob.linkset_specs,
            newJob.linkset_specs, unsavedData.linksetSpecs);

        const lensSpecs = mergeSpecs(
            data.is_lens_specs_update, hasUnsavedLensSpecs, prevJob.lens_specs,
            newJob.lens_specs, unsavedData.lensSpecs);

        const views = mergeSpecs(
            data.is_views_update, hasUnsavedViews, prevJob.views,
            newJob.views, unsavedData.views);

        updateUnsavedData({
            entityTypeSelections,
            views,
            linksetSpecs,
            lensSpecs
        });
    }
}

async function loadJob(id: string): Promise<Job> {
    const response = await fetch(`${api}/job/${id}`);
    if (!response.ok)
        throw new Error(`Unable to fetch job with id ${id}!`);

    const job = await response.json();
    job.created_at = job.created_at ? new Date(job.created_at) : null;
    job.updated_at = job.updated_at ? new Date(job.updated_at) : null;
    job.entity_type_selections = job.entity_type_selections !== null ? job.entity_type_selections : [];
    job.linkset_specs = job.linkset_specs !== null ? job.linkset_specs : [];
    job.lens_specs = job.lens_specs !== null ? job.lens_specs : [];
    job.views = job.views !== null ? job.views : [];
    return job;
}

async function createJob(title: string, description: string, link?: string): Promise<string> {
    const formData = new FormData();
    formData.append('job_title', title);
    formData.append('job_description', description);
    if (link)
        formData.append('job_link', link);

    const response = await fetch(`${api}/job/create`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok)
        throw new Error('Unable to create a job!');

    return (await response.json()).job_id;
}

async function updateJob(job: JobUpdateData): Promise<void> {
    const response = await fetch(`${api}/job/update`, {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(job)
    });

    if (!response.ok && response.status !== 400)
        throw new Error('Unable to save job!');
}

async function deleteJob(id: string): Promise<void> {
    const response = await fetch(`${api}/job/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok)
        throw new Error(`Unable to delete job with id ${id}!`);
}
