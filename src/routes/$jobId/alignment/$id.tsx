import {Suspense} from 'react';
import {createFileRoute, notFound} from '@tanstack/react-router';
import Tabs from 'components/Tabs.tsx';
import Info from 'components/shared/Info.tsx';
import SourcesTargets from 'components/alignment/SourcesTargets.tsx';
import MatchingConfiguration from 'components/alignment/MatchingConfiguration.tsx';
import Links from 'components/shared/Links.tsx';
import Export from 'components/shared/Export.tsx';
import LinksetStatusMenu from 'components/alignment/LinksetStatusMenu.tsx';
import LinksetMenu from 'components/alignment/LinksetMenu.tsx';
import Clusters from 'components/shared/Clusters.tsx';
import useLinksetSpecs from 'hooks/useLinksetSpecs.ts';
import {fetchJob} from 'queries/job.ts';
import {useLinkset} from 'queries/linksets.ts';
import {AlignmentIcon} from 'utils/icons.tsx';
import {Container, MainTypeHeader} from 'utils/components.tsx';
import {LinksetSpec} from 'utils/interfaces.ts';

function Alignment() {
    const {jobId, id} = Route.useParams();
    const {linksetSpecs} = useLinksetSpecs();
    const linketSpec = linksetSpecs.find(linksetSpec => linksetSpec.id === parseInt(id))!;
    const linkset = useLinkset(jobId, linketSpec.id);
    const hasLinkset = linkset !== undefined;
    const hasLinks = hasLinkset && linkset.status === 'done';

    return (
        <>
            <MainTypeHeader menu={<Suspense><LinksetMenu jobId={jobId} linksetSpec={linketSpec}/></Suspense>}>
                <AlignmentIcon/>
                {linketSpec.label}
            </MainTypeHeader>

            <Container>
                <Suspense>
                    <LinksetStatusMenu jobId={jobId} linksetSpec={linketSpec}/>
                </Suspense>

                <Tabs tabs={{
                    'info': {
                        title: 'Info',
                        content: <LinksetSpecInfo linksetSpec={linketSpec}/>
                    },
                    'sources-targets': {
                        title: 'Sources and targets',
                        content: <SourcesTargets linksetSpec={linketSpec} isInUse={hasLinkset}/>
                    },
                    'matching-configuration': {
                        title: 'Matching configuration',
                        content: <MatchingConfiguration linksetSpec={linketSpec} isInUse={hasLinkset}/>
                    },
                    'links': {
                        title: 'Links',
                        content: <Links jobId={jobId} type="linkset" id={linketSpec.id}/>,
                        disabled: !hasLinks
                    },
                    'clusters': {
                        title: 'Clusters',
                        content: <Clusters jobId={jobId} type="linkset" id={linketSpec.id}/>,
                        disabled: !hasLinks
                    },
                    'export': {
                        title: 'Export',
                        content: <Export jobId={jobId} type="linkset" id={linketSpec.id}/>,
                        disabled: !hasLinks
                    }
                }}/>
            </Container>
        </>
    );
}

function LinksetSpecInfo({linksetSpec}: { linksetSpec: LinksetSpec }) {
    const {update} = useLinksetSpecs();

    return (
        <Info metadata={linksetSpec}
              withUpdate={metadata => update(linksetSpec.id, linksetSpec => Object.assign(linksetSpec, metadata))}/>
    );
}

export const Route = createFileRoute('/$jobId/alignment/$id')({
    component: Alignment,
    loader: async ({context: {queryClient}, params: {jobId, id}}) => {
        const job = await fetchJob(queryClient, jobId);
        const linketSpec = job.linkset_specs.find(spec => spec.id === parseInt(id));
        if (linketSpec === undefined)
            throw notFound();
    }
});
