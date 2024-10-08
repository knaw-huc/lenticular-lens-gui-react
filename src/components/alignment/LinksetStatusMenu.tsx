import {useLinksets} from 'queries/linksets.ts';
import {useClusterings} from 'queries/clusterings.ts';
import {Duration} from 'components/Duration.tsx';
import {RunStatusMenu} from 'utils/components.tsx';
import {Clustering, Linkset, LinksetSpec} from 'utils/interfaces.ts';

export default function LinksetStatusMenu({jobId, linksetSpec}: { jobId: string, linksetSpec: LinksetSpec }) {
    const {data: linksets} = useLinksets(jobId);
    const {data: clusterings} = useClusterings(jobId);

    const linkset = linksets.find(linkset => linkset.spec_id === linksetSpec.id);
    const clustering = clusterings.find(clustering => clustering.spec_type === 'linkset' && clustering.spec_id === linksetSpec.id);

    return linkset ? <LinksetStatusMenuShow
        linksetSpec={linksetSpec}
        linkset={linkset}
        clustering={clustering}/> : undefined;
}

function LinksetStatusMenuShow({linksetSpec, linkset, clustering}: {
    linksetSpec: LinksetSpec,
    linkset: Linkset,
    clustering?: Clustering
}) {
    const isRunning = ['downloading', 'running'].includes(linkset.status) || clustering?.status === 'running';
    const hasFailed = linkset.status === 'failed' || clustering?.status === 'failed';

    const status = (() => {
        if (clustering && ['waiting', 'failed'].includes(clustering.status))
            return `Clustering ${clustering.status}`;

        if (clustering?.status === 'running')
            return clustering.status_message!;

        if (['waiting', 'downloading', 'failed'].includes(linkset.status))
            return `Matching ${linkset.status}`;

        if (linkset.status === 'running')
            return linkset.status_message!;

        return undefined;
    })();

    return (
        <RunStatusMenu state={isRunning ? 'running' : (hasFailed ? 'failed' : 'succeeded')} status={status}>
            <div>
                {(linkset.links_count || (linkset.status === 'running' && linksetSpec.use_counter && linkset.links_progress)) && <div>
                    <div>Links found:</div>
                    {(linkset.links_count || linkset.links_progress)!.toLocaleString('en')}
                </div>}

                {clustering?.clusters_count && clustering.status === 'done' && <div>
                    <div>Clusters found:</div>
                    {clustering.clusters_count?.toLocaleString('en') || 0}
                </div>}

                {clustering?.clusters_count && clustering.status === 'running' && <div>
                    <div>Clusters found / Links processed:</div>
                    {clustering.clusters_count?.toLocaleString('en') || 0}
                    {clustering.links_count?.toLocaleString('en') || 0}
                </div>}
            </div>

            <div>
                <div>
                    <div>Source / target / total entities in linkset:</div>
                    {linkset.linkset_sources_count?.toLocaleString('en') || 0} {' / '}
                    {linkset.linkset_targets_count?.toLocaleString('en') || 0} {' / '}
                    {linkset.linkset_entities_count?.toLocaleString('en') || 0}
                </div>

                <div>
                    <div>Entities in source / target / total:</div>
                    {linkset.sources_count?.toLocaleString('en') || 0} {' / '}
                    {linkset.targets_count?.toLocaleString('en') || 0} {' / '}
                    {linkset.entities_count?.toLocaleString('en') || 0}
                </div>
            </div>

            <div>
                {linkset.status === 'waiting' && <div>
                    <div>Request:</div>
                    <Duration from={linkset.requested_at}/>
                </div>}

                {['downloading', 'running'].includes(linkset.status) && <div>
                    <div>Start:</div>
                    <Duration from={linkset.processing_at}/>
                </div>}

                {linkset.finished_at && <div>
                    <div>Matching duration:</div>
                    <Duration from={linkset.processing_at} until={linkset.finished_at}/>
                </div>}

                {clustering?.status === 'waiting' && <div>
                    <div>Request clustering:</div>
                    <Duration from={clustering.requested_at}/>
                </div>}

                {clustering?.status === 'running' && <div>
                    <div>Start clustering:</div>
                    <Duration from={clustering.processing_at}/>
                </div>}

                {clustering?.finished_at && <div>
                    <div>Clustering duration:</div>
                    <Duration from={clustering.processing_at} until={clustering.finished_at}/>
                </div>}
            </div>
        </RunStatusMenu>
    );
}
