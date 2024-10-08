import {Duration} from 'components/Duration.tsx';
import {useLenses} from 'queries/lenses.ts';
import {useClusterings} from 'queries/clusterings.ts';
import {RunStatusMenu} from 'utils/components.tsx';
import {Clustering, Lens, LensSpec} from 'utils/interfaces.ts';

export default function LensStatusMenu({jobId, lensSpec}: { jobId: string, lensSpec: LensSpec }) {
    const {data: lenses} = useLenses(jobId);
    const {data: clusterings} = useClusterings(jobId);

    const lens = lenses.find(lens => lens.spec_id === lensSpec.id);
    const clustering = clusterings.find(clustering => clustering.spec_type === 'lens' && clustering.spec_id === lensSpec.id);

    return lens ? <LensStatusMenuShow lens={lens} clustering={clustering}/> : undefined;
}

function LensStatusMenuShow({lens, clustering}: { lens: Lens, clustering?: Clustering }) {
    const isRunning = lens.status === 'running' || clustering?.status === 'running';
    const hasFailed = lens.status === 'failed' || clustering?.status === 'failed';

    const status = (() => {
        if (clustering && ['waiting', 'failed'].includes(clustering.status))
            return `Clustering ${clustering.status}`;

        if (clustering?.status === 'running')
            return clustering.status_message!;

        if (['waiting', 'failed'].includes(lens.status))
            return `Lens ${lens.status}`;

        if (lens.status === 'running')
            return lens.status_message!;

        return undefined;
    })();

    return (
        <RunStatusMenu state={isRunning ? 'running' : (hasFailed ? 'failed' : 'succeeded')} status={status}>
            <div>
                {lens.links_count && <div>
                    <div>Links found:</div>
                    {lens.links_count!.toLocaleString('en')}
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
                    <div>Source / target entities in lens:</div>
                    {lens.lens_sources_count?.toLocaleString('en') || 0} {' / '}
                    {lens.lens_targets_count?.toLocaleString('en') || 0}
                </div>

                <div>
                    <div>Total entities in lens:</div>
                    {lens.lens_entities_count?.toLocaleString('en') || 0}
                </div>
            </div>

            <div>
                {lens.status === 'waiting' && <div>
                    <div>Request:</div>
                    <Duration from={lens.requested_at}/>
                </div>}

                {lens.status === 'running' && <div>
                    <div>Start:</div>
                    <Duration from={lens.processing_at}/>
                </div>}

                {lens.finished_at && <div>
                    <div>Matching duration:</div>
                    <Duration from={lens.processing_at} until={lens.finished_at}/>
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
