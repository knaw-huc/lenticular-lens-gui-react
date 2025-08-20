import {Suspense} from 'react';
import {createFileRoute, notFound} from '@tanstack/react-router';
import Tabs from 'components/Tabs.tsx';
import Operations from 'components/lens/Operations.tsx';
import Links from 'components/shared/Links.tsx';
import Clusters from 'components/shared/Clusters.tsx';
import LensStatusMenu from 'components/lens/LensStatusMenu.tsx';
import Export from 'components/shared/Export.tsx';
import Info from 'components/shared/Info.tsx';
import LensMenu from 'components/lens/LensMenu.tsx';
import useLensSpecs from 'stores/useLensSpecs.ts';
import {fetchJob} from 'queries/job.ts';
import {useLens} from 'queries/lenses.ts';
import {LensIcon} from 'utils/icons.tsx';
import {Container, MainTypeHeader} from 'utils/components.tsx';
import {LensSpec} from 'utils/interfaces.ts';

function Lens() {
    const {jobId, id} = Route.useParams();
    const lensSpecs = useLensSpecs(state => state.lensSpecs);
    const lensSpec = lensSpecs.find(lensSpec => lensSpec.id === parseInt(id))!;
    const lens = useLens(jobId, lensSpec.id);
    const hasLens = lens !== undefined;
    const hasLensData = hasLens && lens.status === 'done';

    return (
        <>
            <MainTypeHeader menu={<Suspense><LensMenu jobId={jobId} lensSpec={lensSpec}/></Suspense>}>
                <LensIcon/>
                {lensSpec.label}
            </MainTypeHeader>

            <Container>
                <Suspense>
                    <LensStatusMenu jobId={jobId} lensSpec={lensSpec}/>
                </Suspense>

                <Tabs tabs={{
                    'info': {
                        title: 'Info',
                        content: <LensSpecInfo lensSpec={lensSpec}/>
                    },
                    'operations': {
                        title: 'Operations',
                        content: <Operations jobId={jobId} lensSpec={lensSpec} isInUse={hasLens}/>
                    },
                    'links': {
                        title: 'Links',
                        content: <Links jobId={jobId} type="lens" id={lensSpec.id}/>,
                        disabled: !hasLensData
                    },
                    'clusters': {
                        title: 'Clusters',
                        content: <Clusters jobId={jobId} type="lens" id={lensSpec.id}/>,
                        disabled: !hasLensData
                    },
                    'export': {
                        title: 'Export',
                        content: <Export jobId={jobId} type="lens" id={lensSpec.id}/>,
                        disabled: !hasLensData
                    }
                }}/>
            </Container>
        </>
    );
}

function LensSpecInfo({lensSpec}: { lensSpec: LensSpec }) {
    const update = useLensSpecs(state => state.update);

    return (
        <Info metadata={lensSpec}
              withUpdate={metadata => update(lensSpec.id, lensSpec => Object.assign(lensSpec, metadata))}/>
    );
}

export const Route = createFileRoute('/$jobId/lens/$id')({
    component: Lens,
    loader: async ({context: {queryClient}, params: {jobId, id}}) => {
        const job = await fetchJob(queryClient, jobId);
        const lensSpec = job.lens_specs.find(spec => spec.id === parseInt(id));
        if (lensSpec === undefined)
            throw notFound();
    }
});
