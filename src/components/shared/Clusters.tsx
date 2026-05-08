import {Suspense, useState} from 'react';
import {IconChartDots3} from '@tabler/icons-react';
import Modal from 'components/Modal.tsx';
import Property from 'components/Property.tsx';
import Checkbox from 'components/Checkbox.tsx';
import {ResultItem, Results} from 'components/Results.tsx';
import ClustersMenu from 'components/shared/ClustersMenu.tsx';
import ClusterVisualization from 'components/shared/ClusterVisualization.tsx';
import useFilteredClusters from 'stores/useFilteredClusters.ts';
import {
    ClustersProperties,
    useClusters,
    useClusterSelectionProps,
    useClusterSelectionTotals
} from 'queries/clusters.ts';
import useInfiniteLoading from 'hooks/useInfiniteLoading.ts';
import {MinimalCluster, LinksTotals} from 'utils/interfaces.ts';
import {ButtonGroup, Spinner} from 'utils/components.tsx';
import classes from './Clusters.module.css';

export default function Clusters({jobId, type, id}: { jobId: string, type: 'linkset' | 'lens', id: number }) {
    const filteredClusters = useFilteredClusters(state => state.filteredClusters);
    const setFilteredClusters = useFilteredClusters(state => state.setFilteredClusters);
    const [clusterProps, setClusterProps] = useState<ClustersProperties>({});

    return (
        <div>
            <ClustersMenu jobId={jobId} type={type} id={id}
                          filteredClusters={filteredClusters} setFilteredClusters={setFilteredClusters}
                          clusterProps={clusterProps} setClusterProps={setClusterProps}/>

            <Suspense fallback={<Spinner/>}>
                <ClusterResults jobId={jobId} type={type} id={id} clusterProps={clusterProps}
                                filteredClusters={filteredClusters} setFilteredClusters={setFilteredClusters}/>
            </Suspense>
        </div>
    );
}

function ClusterResults({jobId, type, id, clusterProps, filteredClusters, setFilteredClusters}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    clusterProps: ClustersProperties,
    filteredClusters: Set<number>,
    setFilteredClusters: (value: Set<number>) => void
}) {
    const {data, isLoading, fetchNextPage} = useClusters(jobId, type, id, clusterProps);
    const {endOfTheListRef} = useInfiniteLoading(fetchNextPage);

    return (
        <>
            <Results>
                {data.pages.map((page, pageNo) =>
                    <ClusterResultPage jobId={jobId} type={type} id={id}
                                       page={page as MinimalCluster[]} pageNo={pageNo} key={pageNo}
                                       filteredClusters={filteredClusters} setFilteredClusters={setFilteredClusters}/>)}
            </Results>

            <div ref={endOfTheListRef}>
                {isLoading && <Spinner/>}
            </div>
        </>
    );
}

function ClusterResultPage({jobId, type, id, page, pageNo, filteredClusters, setFilteredClusters}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    page: MinimalCluster[],
    pageNo: number,
    filteredClusters: Set<number>,
    setFilteredClusters: (value: Set<number>) => void
}) {
    const pageClusterIds = page.map(cluster => cluster.id);

    function toggleFilteredClusters(id: number, isFiltered: boolean) {
        const newFilteredClusters = new Set(filteredClusters);
        if (isFiltered)
            newFilteredClusters.add(id);
        else
            newFilteredClusters.delete(id);
        setFilteredClusters(newFilteredClusters);
    }

    return (
        <>
            {page.map((cluster, idx) =>
                <ClusterResultItem key={`${pageNo}_${idx}`} jobId={jobId} type={type} id={id}
                                   cluster={cluster} pageClusterIds={pageClusterIds}
                                   inSelection={filteredClusters.has(cluster.id)}
                                   setInSelection={inSelection =>
                                       toggleFilteredClusters(cluster.id, inSelection)}/>)}
        </>
    );
}

function ClusterResultItem({jobId, type, id, cluster, pageClusterIds, inSelection, setInSelection}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    cluster: MinimalCluster,
    pageClusterIds: number[],
    inSelection: boolean,
    setInSelection: (inSelection: boolean) => void,
}) {
    const isAllValidated = cluster.links.unchecked === 0;

    return (
        <ResultItem>
            <div className={classes.cluster}>
                <div className={classes.header}>
                    <div className={classes.id}>#{cluster.id}</div>

                    <div className={classes.state}>
                        <div>
                            <div>Extended:</div>
                            <span className={classes[String(cluster.extended)]}>
                                {cluster.extended ? 'yes' : 'no'}
                            </span>
                        </div>

                        <div>
                            <div>Reconciled:</div>
                            <span className={classes[String(cluster.reconciled)]}>
                                {cluster.reconciled ? 'yes' : 'no'}
                            </span>
                        </div>

                        <div>
                            <div>All validated:</div>
                            <span className={classes[String(isAllValidated)]}>
                                {isAllValidated ? 'yes' : 'no'}
                            </span>
                        </div>
                    </div>

                    <ButtonGroup>
                        <Checkbox asButton checked={inSelection} onCheckedChange={setInSelection}>
                            Include in selection
                        </Checkbox>

                        <Modal title="Visualize cluster" fullScreenMode
                               trigger={<button><IconChartDots3 size="1.3em"/> Visualize</button>}>
                            <ClusterVisualization jobId={jobId} type={type} id={id} graphId={cluster.id}/>
                        </Modal>
                    </ButtonGroup>
                </div>

                <div className={classes.statistics}>
                    <div>
                        <div>
                            <div>Number of nodes (size):</div>

                            <span>
                                {cluster.size.toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="size"/>
                                </Suspense>
                            </span>
                        </div>

                        <div>
                            <div>Number of links:</div>

                            <span>
                                {Object.values(cluster.links).reduce((a, b) => a + b, 0).toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="links"/>
                                </Suspense>
                            </span>
                        </div>
                    </div>

                    <div>
                        <div>
                            <div>Accepted:</div>

                            <span>
                                {cluster.links.accepted.toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="accepted"/>
                                </Suspense>
                            </span>
                        </div>

                        <div>
                            <div>Rejected:</div>

                            <span>
                                {cluster.links.rejected.toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="rejected"/>
                                </Suspense>
                            </span>
                        </div>

                        <div>
                            <div>Uncertain:</div>

                            <span>
                                {cluster.links.uncertain.toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="uncertain"/>
                                </Suspense>
                            </span>
                        </div>

                        <div>
                            <div>Unchecked:</div>

                            <span>
                                {cluster.links.unchecked.toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="unchecked"/>
                                </Suspense>
                            </span>
                        </div>

                        {type === 'lens' && <div>
                            <div>Disputed:</div>

                            <span>
                                {cluster.links.disputed.toLocaleString('en')} {' / '}
                                <Suspense fallback={<Spinner type="inline"/>}>
                                    <Total jobId={jobId} type={type} id={id}
                                           pageClusterIds={pageClusterIds} clusterId={cluster.id}
                                           show="disputed"/>
                                </Suspense>
                            </span>
                        </div>}
                    </div>
                </div>

                <Suspense fallback={<Spinner/>}>
                    <ClusterValues jobId={jobId} type={type} id={id}
                                   pageClusterIds={pageClusterIds} clusterId={cluster.id}/>
                </Suspense>
            </div>
        </ResultItem>
    );
}

function Total({jobId, type, id, pageClusterIds, clusterId, show}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    pageClusterIds: number[],
    clusterId: number,
    show: 'size' | 'links' | keyof LinksTotals,
}) {
    const {data} = useClusterSelectionTotals(jobId, type, id, pageClusterIds);
    const totals = data[clusterId];

    switch (show) {
        case 'size':
            return totals.size.toLocaleString('en');
        case 'links':
            return Object.values(totals.links).reduce((a, b) => a + b, 0).toLocaleString('en');
        default:
            return totals.links[show].toLocaleString('en');
    }
}

function ClusterValues({jobId, type, id, pageClusterIds, clusterId}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    pageClusterIds: number[],
    clusterId: number
}) {
    const {data} = useClusterSelectionProps(jobId, type, id, pageClusterIds);
    const clusterValues = data[clusterId];

    return (
        <>
            {clusterValues && clusterValues.length > 0 && <div className={classes.props}>
                {clusterValues.map(values =>
                    <Property key={values.property.join('_')}
                              showLabel
                              readOnly
                              startCollapsed
                              allowCollapse
                              property={values.property}
                              values={values.values}
                              datasetRef={values.dataset}/>
                )}
            </div>}
        </>
    );
}
