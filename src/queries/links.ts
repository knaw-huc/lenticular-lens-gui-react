import {
    InfiniteData,
    useMutation,
    useQueryClient,
    useSuspenseQuery,
    useSuspenseInfiniteQuery
} from '@tanstack/react-query';
import {Link, LinksTotals, ValidationState} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

interface LinksTotalsProperties {
    min: number;
    max: number;
}

export interface LinksProperties extends LinksTotalsProperties {
    accepted: boolean;
    rejected: boolean;
    uncertain: boolean;
    unchecked: boolean;
    disputed: boolean;
    sort: 'asc' | 'desc';
}

interface ClusterIds {
    clusterIds: number[];
}

type LinksTotalsProps = LinksTotalsProperties & ClusterIds;
export type LinksProps = LinksProperties & ClusterIds;

const pageSize = 20;

export async function runSpec(jobId: string, type: 'linkset' | 'lens', id: number, restart: boolean): Promise<'ok' | 'exists' | 'error'> {
    const body = new FormData();
    body.append('restart', restart.toString());

    const result = await fetch(`${api}/job/${jobId}/${type}/${id}/links/run`, {
        method: 'POST',
        body
    });

    if (result.ok)
        return 'ok';

    if (result.status === 400 && (await result.json()).result === 'exists')
        return 'exists';

    return 'error';
}

export function useLinks(jobId: string, type: 'linkset' | 'lens', id: number, props: LinksProps) {
    return useSuspenseInfiniteQuery({
        queryKey: ['links', jobId, type, id, props],
        initialPageParam: 0,
        getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
        queryFn: async ({pageParam}) => loadLinks(jobId, type, id, pageParam, props)
    });
}

export function useLinksTotals(jobId: string, type: 'linkset' | 'lens', id: number,
                               props: LinksProps, applyFilters: boolean = false) {
    return useSuspenseQuery({
        queryKey: ['links_totals', jobId, type, id, props, applyFilters],
        queryFn: async () => loadLinksTotals(jobId, type, id, props, applyFilters)
    });
}

export function useResetLinks(jobId: string, type: 'linkset' | 'lens', id: number, props: LinksProps) {
    const queryClient = useQueryClient();
    return (reset: 'all' | 'filtered' | 'not_filtered' | 'links_only' = 'all') => Promise.all([
        queryClient.invalidateQueries({queryKey: ['links', jobId, type, id, props]}),
        (reset === 'all' || reset === 'filtered') && queryClient.invalidateQueries({queryKey: ['links_totals', jobId, type, id, props, true]}),
        (reset === 'all' || reset === 'not_filtered') && queryClient.invalidateQueries({queryKey: ['links_totals', jobId, type, id, props, false]})
    ]);
}

export function useValidateLink(jobId: string, type: 'linkset' | 'lens', id: number, props: LinksProps) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({source, target, validation}: { source: string, target: string, validation: ValidationState }) =>
            validateLink(jobId, type, id, source, target, validation),
        onMutate: async ({source, target, validation}) => {
            await Promise.all([
                queryClient.cancelQueries({queryKey: ['links', jobId, type, id, props]}),
                queryClient.cancelQueries({queryKey: ['links_totals', jobId, type, id, props, true]}),
                queryClient.cancelQueries({queryKey: ['links_totals', jobId, type, id, props, false]})
            ]);

            const prevLinks = queryClient.getQueryData(['links', jobId, type, id, props]);
            const prevTotalsFiltered = queryClient.getQueryData(['links_totals', jobId, type, id, props, true]);
            const prevTotalsUnFiltered = queryClient.getQueryData(['links_totals', jobId, type, id, props, false]);

            queryClient.setQueryData(['links', jobId, type, id, props], (oldLinks: InfiniteData<Link[], number>) => mutateLinks(oldLinks, source, target, link => {
                const before = link.valid;
                const after = before === validation ? 'unchecked' : validation;

                for (const isFiltered of [true, false])
                    queryClient.setQueryData(['links_totals', jobId, type, id, props, isFiltered], (oldLinksTotals: LinksTotals) => {
                        const linksTotals = {...oldLinksTotals};
                        linksTotals[before] = linksTotals[before] - 1;
                        linksTotals[after] = linksTotals[after] + 1;
                        return linksTotals;
                    });

                return {...link, valid: after};
            }));

            return {prevLinks, prevTotalsFiltered, prevTotalsUnFiltered};
        },
        onError: (_err, _vars, context) => {
            context?.prevLinks && queryClient.setQueryData(['links', jobId, type, id, props], context.prevLinks);
            context?.prevTotalsFiltered && queryClient.setQueryData(['links_totals', jobId, type, id, props, true], context.prevTotalsFiltered);
            context?.prevTotalsUnFiltered && queryClient.setQueryData(['links_totals', jobId, type, id, props, false], context.prevTotalsUnFiltered);
        }
    });
}

export function useValidateSelection(jobId: string, type: 'linkset' | 'lens', id: number, props: LinksProps) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({validation}: { validation: ValidationState }) =>
            validateSelection(jobId, type, id, props, validation),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({queryKey: ['links', jobId, type, id, props]}),
            queryClient.invalidateQueries({queryKey: ['links_totals', jobId, type, id, props, true]})
        ])
    });
}

export function useMotivateLink(jobId: string, type: 'linkset' | 'lens', id: number, props: LinksProps) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({source, target, motivation}: { source: string, target: string, motivation: string }) =>
            motivateLink(jobId, type, id, source, target, motivation),
        onMutate: async ({source, target, motivation}) => {
            await queryClient.cancelQueries({queryKey: ['links', jobId, type, id, props]});

            const prevLinks = queryClient.getQueryData(['links', jobId, type, id, props]);
            queryClient.setQueryData(['links', jobId, type, id, props], (oldLinks: InfiniteData<Link[], number>) =>
                mutateLinks(oldLinks, source, target, link =>
                    ({...link, motivation})));

            return {prevLinks};
        },
        onError: (_err, _vars, context) => {
            context?.prevLinks && queryClient.setQueryData(['links', jobId, type, id, props], context.prevLinks);
        }
    });
}

export function useMotivateSelection(jobId: string, type: 'linkset' | 'lens', id: number, props: LinksProps) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({motivation}: { motivation: string }) =>
            motivateSelection(jobId, type, id, props, motivation),
        onSuccess: async () => queryClient.invalidateQueries({queryKey: ['links', jobId, type, id, props]})
    });
}

async function loadLinks(jobId: string, type: 'linkset' | 'lens', id: number, page: number, props: LinksProps): Promise<Link[]> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/links`, {
        method: 'POST',
        body: createLinksFormData(props, true, 'multiple', page)
    });

    if (!response.ok)
        throw new Error('Unable to fetch links!');

    const results = await response.json();
    return results.map((link: Link, idx: number) => ({
        ...link,
        count: (pageSize * page) + idx + 1
    }));
}

async function loadLinksTotals(jobId: string, type: 'linkset' | 'lens', id: number,
                               props: LinksTotalsProps, applyFilters: boolean = false): Promise<LinksTotals> {
    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/links/totals`, {
        method: 'POST',
        body: createLinksTotalsFormData(props, applyFilters)
    });

    if (!response.ok)
        throw new Error('Unable to fetch links totals!');

    return response.json();
}

async function validateLink(jobId: string, type: 'linkset' | 'lens', id: number,
                            source: string, target: string, validation: ValidationState): Promise<void> {
    const formData = new FormData();
    formData.append('validation', validation);
    formData.append('apply_filters', 'false');
    formData.append('source', source);
    formData.append('target', target);

    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/validate`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok)
        throw new Error('Unable to validate link!');
}

async function validateSelection(jobId: string, type: 'linkset' | 'lens', id: number,
                                 props: LinksProps, validation: ValidationState): Promise<void> {
    const body = createLinksFormData(props, true);
    body.append('validation', validation);

    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/validate`, {
        method: 'POST',
        body
    });

    if (!response.ok)
        throw new Error('Unable to validate link selection!');
}

async function motivateLink(jobId: string, type: 'linkset' | 'lens', id: number,
                            source: string, target: string, motivation: string): Promise<void> {
    const formData = new FormData();
    formData.append('motivation', motivation);
    formData.append('apply_filters', 'false');
    formData.append('source', source);
    formData.append('target', target);

    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/motivate`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok)
        throw new Error('Unable to motivate link!');
}

async function motivateSelection(jobId: string, type: 'linkset' | 'lens', id: number,
                                 props: LinksProps, motivation: string): Promise<void> {
    const body = createLinksFormData(props, true);
    body.append('motivation', motivation);

    const response = await fetch(`${api}/job/${jobId}/${type}/${id}/motivate`, {method: 'POST', body});
    if (!response.ok)
        throw new Error('Unable to motivate link selection!');
}

function mutateLinks(oldLinks: InfiniteData<Link[], number>, source: string, target: string, mutateLink: (link: Link) => Link) {
    const newLinks = {...oldLinks};
    const newPages = [...newLinks.pages];
    newLinks.pages = newPages;

    const findLink = (link: Link) => link.source === source && link.target === target;
    const pageIndex = newPages.findIndex(page => page.find(findLink));
    const linkIndex = pageIndex !== -1 ? newPages[pageIndex].findIndex(findLink) : -1;
    if (linkIndex === -1)
        return oldLinks;

    const newPageLinks = [...newPages[pageIndex]];
    newPages[pageIndex] = newPageLinks;

    const link = newPageLinks[linkIndex];
    newPageLinks[linkIndex] = mutateLink(link);

    return newLinks;
}

function createLinksTotalsFormData(props: LinksTotalsProps, applyFilters: boolean = false) {
    const data = new FormData();
    data.append('apply_filters', applyFilters.toString());

    if (applyFilters) {
        for (const clusterId of props.clusterIds)
            data.append('cluster_id', clusterId.toString());

        props.min > 0 && data.append('min', props.min.toString());
        props.max < 1 && data.append('max', props.max.toString());
    }

    return data;
}

function createLinksFormData(props: LinksProps, applyFilters: boolean = false,
                             withProperties?: 'none' | 'multiple', page?: number) {
    const data = createLinksTotalsFormData(props, applyFilters);
    withProperties !== undefined && data.append('with_properties', withProperties);

    props.accepted && data.append('valid', 'accepted');
    props.rejected && data.append('valid', 'rejected');
    props.uncertain && data.append('valid', 'uncertain');
    props.unchecked && data.append('valid', 'unchecked');
    props.disputed && data.append('valid', 'disputed');

    props.sort && data.append('sort', props.sort);

    if (page !== undefined) {
        data.append('limit', pageSize.toString());
        data.append('offset', (pageSize * page).toString());
    }

    return data;
}
