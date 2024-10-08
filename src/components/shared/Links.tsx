import {Suspense, useContext, useState} from 'react';
import {IconPencil, IconCheck, IconX, IconQuestionMark} from '@tabler/icons-react';
import Uri from 'components/Uri.tsx';
import Dropdown from 'components/Dropdown.tsx';
import Property from 'components/Property.tsx';
import {ResultItem, Results} from 'components/Results.tsx';
import LinksMotivation from 'components/shared/LinksMotivation.tsx';
import LinksMenu from 'components/shared/LinksMenu.tsx';
import {FilteredClustersContext} from 'context/FilteredClustersContext.tsx';
import {useLinks, LinksProperties, useValidateLink, useMotivateLink} from 'queries/links.ts';
import useInfiniteLoading from 'hooks/useInfiniteLoading.ts';
import {Link, ValidationState} from 'utils/interfaces.ts';
import {LabelGroup, Spinner} from 'utils/components.tsx';
import classes from './Links.module.css';

export default function Links({jobId, type, id}: { jobId: string, type: 'linkset' | 'lens', id: number }) {
    const {filteredClusters} = useContext(FilteredClustersContext);
    const [linksProps, setLinksProps] = useState<LinksProperties>({
        accepted: false,
        rejected: false,
        uncertain: false,
        unchecked: false,
        disputed: false,
        sort: 'asc',
        min: 0,
        max: 1
    });

    return (
        <div>
            <LinksMenu jobId={jobId} type={type} id={id} filteredClusters={filteredClusters}
                       linksProps={linksProps} setLinksProps={setLinksProps}/>

            <Suspense fallback={<Spinner/>}>
                <LinksResults jobId={jobId} type={type} id={id}
                              linksProps={linksProps} filteredClusters={filteredClusters}/>
            </Suspense>
        </div>
    );
}

function LinksResults({jobId, type, id, linksProps, filteredClusters}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    linksProps: LinksProperties,
    filteredClusters: Set<number>
}) {
    const props = {...linksProps, clusterIds: [...filteredClusters]};
    const {data, isLoading, fetchNextPage} = useLinks(jobId, type, id, props);
    const {endOfTheListRef} = useInfiniteLoading(fetchNextPage);
    const validateMutation = useValidateLink(jobId, type, id, props);
    const motivateMutation = useMotivateLink(jobId, type, id, props);

    function onValidate(link: Link, validation: ValidationState) {
        validateMutation.mutate({source: link.source, target: link.target, validation});
    }

    function onMotivate(link: Link, motivation: string) {
        motivateMutation.mutate({source: link.source, target: link.target, motivation});
    }

    return (
        <>
            <Results className={classes.results} distinctLines={false}>
                {data.pages.map((page, pageNo) =>
                    (page as Link[]).map((link, idx) =>
                        <LinkResultItem key={`${pageNo}_${idx}`} link={link}
                                        onValidate={validation => onValidate(link, validation)}
                                        onMotivate={motivation => onMotivate(link, motivation)}/>))}
            </Results>

            <div ref={endOfTheListRef}>
                {isLoading && <Spinner/>}
            </div>
        </>
    );
}

function LinkResultItem({link, onValidate, onMotivate}: {
    link: Link,
    onValidate: (validation: ValidationState) => void,
    onMotivate: (motivation: string) => void
}) {
    const className = (() => {
        switch (link.valid) {
            case 'accepted':
                return classes.accepted;
            case 'rejected':
                return classes.rejected;
            case 'uncertain':
                return classes.uncertain;
            case 'disputed':
                return classes.disputed;
            default:
                return '';
        }
    })();

    const switchSides = link.link_order === 'target_source';
    const sourceValues = switchSides ? link.target_values : link.source_values;
    const targetValues = switchSides ? link.source_values : link.target_values;

    return (
        <ResultItem className={className}>
            <div className={classes.link}>
                <div className={classes.linkOptions}>
                    <div className={classes.linkOptionsCount}>#{link.count}</div>

                    <LabelGroup label="Similarity">
                        {link.similarity.toFixed(3)}
                    </LabelGroup>

                    <LabelGroup label="Cluster">
                        #{link.cluster_id}
                    </LabelGroup>
                </div>

                <div className={classes.uris}>
                    <Uri uri={switchSides ? link.target : link.source} label="Source URI"/>
                    <Uri uri={switchSides ? link.source : link.target} label="Target URI"/>
                </div>

                {sourceValues.length > 0 && <LabelGroup label="Source" className={classes.sourceProps}>
                    {sourceValues.map(linkValues =>
                        <Property key={linkValues.property.join('_')}
                                  showLabel
                                  readOnly
                                  startCollapsed
                                  allowCollapse
                                  property={linkValues.property}
                                  values={linkValues.values}
                                  datasetRef={{
                                      timbuctoo_graphql: linkValues.graphql_endpoint,
                                      dataset_id: linkValues.dataset_id,
                                      collection_id: linkValues.collection_id
                                  }}/>
                    )}
                </LabelGroup>}

                {targetValues.length > 0 && <LabelGroup label="Target" className={classes.targetProps}>
                    {targetValues.map(linkValues =>
                        <Property key={linkValues.property.join('_')}
                                  showLabel
                                  readOnly
                                  startCollapsed
                                  allowCollapse
                                  property={linkValues.property}
                                  values={linkValues.values}
                                  datasetRef={{
                                      timbuctoo_graphql: linkValues.graphql_endpoint,
                                      dataset_id: linkValues.dataset_id,
                                      collection_id: linkValues.collection_id
                                  }}/>
                    )}
                </LabelGroup>}

                <div className={classes.validation}>
                    <button className={classes.accept} onClick={_ => onValidate('accepted')}>
                        <IconCheck size="1.3em"/>
                        Accept
                    </button>

                    <button className={classes.reject} onClick={_ => onValidate('rejected')}>
                        <IconX size="1.3em"/>
                        Reject
                    </button>

                    <button className={classes.uncertain} onClick={_ => onValidate('uncertain')}>
                        <IconQuestionMark size="1.3em"/>
                        Uncertain
                    </button>

                    <Dropdown className={classes.motivation} trigger={<><IconPencil size="1.3em"/> Motivate</>}>
                        {CloseButton =>
                            <LinksMotivation value={link.motivation}
                                             onSave={motivation => onMotivate(motivation)}
                                             CloseButton={CloseButton}/>}
                    </Dropdown>
                </div>
            </div>
        </ResultItem>
    );
}
