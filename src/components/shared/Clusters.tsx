import {Suspense, useContext, useState} from 'react';
import {IconChartDots3} from '@tabler/icons-react';
import Modal from 'components/Modal.tsx';
import Property from 'components/Property.tsx';
import Checkbox from 'components/Checkbox.tsx';
import {ResultItem, Results} from 'components/Results.tsx';
import ClustersMenu from 'components/shared/ClustersMenu.tsx';
import ClusterVisualization from 'components/shared/ClusterVisualization.tsx';
import {FilteredClustersContext} from 'context/FilteredClustersContext.tsx';
import {ClustersProperties, useClusters} from 'queries/clusters.ts';
import useInfiniteLoading from 'hooks/useInfiniteLoading.ts';
import {Cluster} from 'utils/interfaces.ts';
import {ButtonGroup, Spinner} from 'utils/components.tsx';
import classes from './Clusters.module.css';

export default function Clusters({jobId, type, id}: { jobId: string, type: 'linkset' | 'lens', id: number }) {
    const {filteredClusters, setFilteredClusters} = useContext(FilteredClustersContext);
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
    const {data, isLoading, fetchNextPage} = useClusters(jobId, type, id, {
        ...clusterProps, clusterIds: [...filteredClusters]
    });
    const {endOfTheListRef} = useInfiniteLoading(fetchNextPage);

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
            <Results>
                {data.pages.map((page, pageNo) =>
                    (page as Cluster[]).map((cluster, idx) =>
                        <ClusterResultItem key={`${pageNo}_${idx}`} jobId={jobId} type={type} id={id} cluster={cluster}
                                           inSelection={filteredClusters.has(cluster.id)}
                                           setInSelection={inSelection =>
                                               toggleFilteredClusters(cluster.id, inSelection)}/>))}
            </Results>

            <div ref={endOfTheListRef}>
                {isLoading && <Spinner/>}
            </div>
        </>
    );
}

function ClusterResultItem({jobId, type, id, cluster, inSelection, setInSelection}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    cluster: Cluster,
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
                            {cluster.size_filtered.toLocaleString('en')} {' / '}
                            {cluster.size.toLocaleString('en')}
                        </div>

                        <div>
                            <div>Number of links:</div>
                            {Object.values(cluster.links_filtered).reduce((a, b) => a + b, 0).toLocaleString('en')} {' / '}
                            {Object.values(cluster.links).reduce((a, b) => a + b, 0).toLocaleString('en')}
                        </div>
                    </div>

                    <div>
                        <div>
                            <div>Accepted:</div>
                            {cluster.links.accepted.toLocaleString('en')} {' / '}
                            {cluster.links_filtered.accepted.toLocaleString('en')}
                        </div>

                        <div>
                            <div>Rejected:</div>
                            {cluster.links.rejected.toLocaleString('en')} {' / '}
                            {cluster.links_filtered.rejected.toLocaleString('en')}
                        </div>

                        <div>
                            <div>Uncertain:</div>
                            {cluster.links.uncertain.toLocaleString('en')} {' / '}
                            {cluster.links_filtered.uncertain.toLocaleString('en')}
                        </div>

                        <div>
                            <div>Unchecked:</div>
                            {cluster.links.unchecked.toLocaleString('en')} {' / '}
                            {cluster.links_filtered.unchecked.toLocaleString('en')}
                        </div>

                        {type === 'lens' && <div>
                            <div>Disputed:</div>
                            {cluster.links.disputed.toLocaleString('en')} {' / '}
                            {cluster.links_filtered.disputed.toLocaleString('en')}
                        </div>}
                    </div>
                </div>

                {cluster.values.length > 0 && <div className={classes.props}>
                    {cluster.values.map(values =>
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
            </div>
        </ResultItem>
    );
}
