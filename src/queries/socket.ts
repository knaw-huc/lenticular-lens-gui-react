import {io} from 'socket.io-client';
import {QueryClient} from '@tanstack/react-query';
import {onJobUpdate} from 'queries/job.ts';
import {resetMethods} from 'queries/methods.ts';
import {resetDownloads, updateDownload} from 'queries/downloads.ts';
import {prefetchLinksets, resetLinksets} from 'queries/linksets.ts';
import {prefetchLenses, resetLenses} from 'queries/lenses.ts';
import {prefetchClusterings, resetClusterings} from 'queries/clusterings.ts';
import {
    Linkset, Lens, Clustering, UnsavedData, AlignmentDelete, AlignmentUpdate, ClusteringDelete, ClusteringUpdate
} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

export function setUpSocket(queryClient: QueryClient) {
    const socket = io(`${api}/`);
    socket.on('timbuctoo_update', e => updateDownload(queryClient, JSON.parse(e)));
    socket.on('timbuctoo_delete', _ => resetDownloads(queryClient));
    socket.on('extension_update', _ => resetMethods(queryClient));
    socket.io.on('reconnect', _ => resetDownloads(queryClient));

    return () => {
        socket.off('timbuctoo_update');
        socket.off('timbuctoo_delete');
        socket.off('extension_update');
        socket.io.off('reconnect');
        socket.disconnect();
    };
}

export function setUpJobSocket(queryClient: QueryClient, jobId: string,
                               getUnsavedData: () => UnsavedData, updateUnsavedData: (unsavedData: UnsavedData) => void) {
    const socket = io(`${api}/${jobId}`);
    socket.on('job_update', e => onJobUpdate(queryClient, JSON.parse(e), getUnsavedData(), updateUnsavedData));
    socket.on('alignment_update', e => onAlignmentUpdate(queryClient, JSON.parse(e)));
    socket.on('alignment_delete', e => onAlignmentDelete(queryClient, JSON.parse(e)));
    socket.on('clustering_update', e => onClusteringUpdate(queryClient, JSON.parse(e)));
    socket.on('clustering_delete', e => onClusteringDelete(queryClient, JSON.parse(e)));
    socket.io.on('reconnect', _ => onReconnect(queryClient, jobId, getUnsavedData(), updateUnsavedData));

    return () => {
        socket.off('job_update');
        socket.off('alignment_update');
        socket.off('alignment_delete');
        socket.off('clustering_update');
        socket.off('clustering_delete');
        socket.io.off('reconnect');
        socket.disconnect();
    };
}

async function onAlignmentUpdate(queryClient: QueryClient, data: AlignmentUpdate) {
    if (data.spec_type === 'linkset') {
        const linksets = queryClient.getQueryData<Linkset[]>(['linksets', data.job_id]);
        const linkset = linksets?.find(linkset => linkset.spec_id === data.spec_id);

        if (!linkset || linkset.status !== data.status || linkset.status_message !== data.status_message)
            await queryClient.refetchQueries({queryKey: ['linksets', data.job_id]});
        else
            queryClient.setQueryData(['linksets', data.job_id], (oldLinksets: Linkset[]) => {
                const index = oldLinksets.findIndex(linkset => linkset.spec_id === data.spec_id);
                const linkset = {
                    ...oldLinksets[index],
                    status_message: data.status_message,
                    links_progress: data.links_progress
                };

                const newLinksets = [...oldLinksets];
                newLinksets[index] = linkset;
                return newLinksets;
            });
    }
    else {
        const lenses = queryClient.getQueryData<Lens[]>(['lenses', data.job_id]);
        const lens = lenses?.find(lens => lens.spec_id === data.spec_id);

        if (!lens || lens.status !== data.status || lens.status_message !== data.status_message)
            await queryClient.refetchQueries({queryKey: ['lenses', data.job_id]});
        else
            queryClient.setQueryData(['lenses', data.job_id], (oldLenses: Lens[]) => {
                const index = oldLenses.findIndex(lens => lens.spec_id === data.spec_id);
                const lens = {
                    ...oldLenses[index],
                    status_message: data.status_message
                };

                const newLenses = [...oldLenses];
                newLenses[index] = lens;
                return newLenses;
            });
    }
}

async function onAlignmentDelete(queryClient: QueryClient, data: AlignmentDelete) {
    resetLinksets(queryClient, data.job_id);
    resetLenses(queryClient, data.job_id);
    return Promise.all([
        prefetchLinksets(queryClient, data.job_id),
        prefetchLenses(queryClient, data.job_id)
    ]);
}

async function onClusteringUpdate(queryClient: QueryClient, data: ClusteringUpdate) {
    const clusterings = queryClient.getQueryData<Clustering[]>(['clusterings', data.job_id]);
    const clustering = clusterings?.find(clustering =>
        clustering.spec_type === data.spec_type && clustering.spec_id === data.spec_id);

    if (!clustering || clustering.status !== data.status)
        await queryClient.refetchQueries({queryKey: ['clusterings', data.job_id]});
    else
        queryClient.setQueryData(['clusterings', data.job_id], (oldClusterings: Clustering[]) => {
            const index = oldClusterings.findIndex(clustering =>
                clustering.spec_type === data.spec_type && clustering.spec_id === data.spec_id);
            const clustering = {
                ...oldClusterings[index],
                status_message: data.status_message,
                links_count: data.links_count,
                clusters_count: data.clusters_count
            };

            const newClusterings = [...oldClusterings];
            newClusterings[index] = clustering;
            return newClusterings;
        });
}

async function onClusteringDelete(queryClient: QueryClient, data: ClusteringDelete) {
    resetClusterings(queryClient, data.job_id);
    return prefetchClusterings(queryClient, data.job_id);
}

async function onReconnect(queryClient: QueryClient, jobId: string, unsavedData: UnsavedData,
                           updateUnsavedData: (unsavedData: UnsavedData) => void) {
    await onJobUpdate(queryClient, {
        job_id: jobId,
        updated_at: new Date(),
        is_title_update: true,
        is_description_update: true,
        is_link_update: true,
        is_entity_type_selections_update: true,
        is_linkset_specs_update: true,
        is_lens_specs_update: true,
        is_views_update: true
    }, unsavedData, updateUnsavedData);

    resetLinksets(queryClient, jobId);
    resetLenses(queryClient, jobId);
    resetClusterings(queryClient, jobId);

    await Promise.all([
        prefetchLinksets(queryClient, jobId),
        prefetchLenses(queryClient, jobId),
        prefetchClusterings(queryClient, jobId)
    ]);
}
