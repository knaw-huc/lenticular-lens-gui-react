import {Suspense} from 'react';
import {IconCheckbox, IconSortAscendingNumbers, IconSortDescendingNumbers} from '@tabler/icons-react';
import Checkbox from 'components/Checkbox.tsx';
import RangeFilter from 'components/RangeFilter.tsx';
import {ClustersProperties, useClustersTotals} from 'queries/clusters.ts';
import {useClusterings} from 'queries/clusterings.ts';
import {ButtonGroup, Spinner, StickyMenu} from 'utils/components.tsx';
import classes from './ClustersMenu.module.css';

export default function ClustersMenu(
    {
        jobId,
        type,
        id,
        filteredClusters,
        setFilteredClusters,
        clusterProps,
        setClusterProps
    }: {
        jobId: string,
        type: 'linkset' | 'lens',
        id: number,
        filteredClusters: Set<number>,
        setFilteredClusters: (value: Set<number>) => void,
        clusterProps: ClustersProperties,
        setClusterProps: (value: ((prevProps: ClustersProperties) => ClustersProperties)) => void
    }) {
    const {data} = useClusterings(jobId);
    const clustering = data.find(clustering => clustering.spec_type === type && clustering.spec_id === id)!;

    function setProp<K extends keyof ClustersProperties>(prop: K, value: ClustersProperties[K]) {
        setClusterProps(prevProps => ({...prevProps, [prop]: value}));
    }

    return (
        <StickyMenu className={classes.menu}>
            <div>
                <div className={classes.counts}>
                    <div className={classes.label}>Filtered / selected / total clusters:</div>
                    <Suspense fallback={<Spinner type="inline"/>}>
                        <Total jobId={jobId} type={type} id={id}
                               filteredClusters={filteredClusters} clusterProps={clusterProps}/>
                    </Suspense> {' / '}
                    {filteredClusters.size.toLocaleString('en')} {' / '}
                    {clustering.clusters_count?.toLocaleString('en') || 0}
                </div>

                <Suspense fallback={<Spinner type="inline"/>}>
                    <SelectAllButton jobId={jobId} type={type} id={id}
                                     filteredClusters={filteredClusters} setFilteredClusters={setFilteredClusters}
                                     clusterProps={clusterProps}/>
                </Suspense>
            </div>

            {clustering.smallest_size < clustering.largest_size && <div>
                <RangeFilter label="Size" step={1}
                             min={clustering.smallest_size} max={clustering.largest_size}
                             minValue={clusterProps.minSize || clustering.smallest_size}
                             maxValue={clusterProps.maxSize || clustering.largest_size}
                             onMinChange={count => setProp('minSize', count)}
                             onMaxChange={count => setProp('maxSize', count)}/>

                <ButtonGroup>
                    <Checkbox asButton checked={clusterProps.sort === 'size_asc'}
                              onCheckedChange={sortAscending => setProp('sort', sortAscending ? 'size_asc' : undefined)}>
                        <IconSortAscendingNumbers size="1.3em"/>
                        Sort on size asc
                    </Checkbox>

                    <Checkbox asButton checked={clusterProps.sort === 'size_desc'}
                              onCheckedChange={sortDescending => setProp('sort', sortDescending ? 'size_desc' : undefined)}>
                        <IconSortDescendingNumbers size="1.3em"/>
                        Sort on size desc
                    </Checkbox>
                </ButtonGroup>
            </div>}

            {clustering.smallest_count < clustering.largest_count && <div>
                <RangeFilter label="Count" step={1}
                             min={clustering.smallest_count} max={clustering.largest_count}
                             minValue={clusterProps.minCount || clustering.smallest_count}
                             maxValue={clusterProps.maxCount || clustering.largest_count}
                             onMinChange={count => setProp('minCount', count)}
                             onMaxChange={count => setProp('maxCount', count)}/>

                <ButtonGroup>
                    <Checkbox asButton checked={clusterProps.sort === 'count_asc'}
                              onCheckedChange={sortAscending => setProp('sort', sortAscending ? 'count_asc' : undefined)}>
                        <IconSortAscendingNumbers size="1.3em"/>
                        Sort on count asc
                    </Checkbox>

                    <Checkbox asButton checked={clusterProps.sort === 'count_desc'}
                              onCheckedChange={sortDescending => setProp('sort', sortDescending ? 'count_desc' : undefined)}>
                        <IconSortDescendingNumbers size="1.3em"/>
                        Sort on count desc
                    </Checkbox>
                </ButtonGroup>
            </div>}
        </StickyMenu>
    );
}

function Total({jobId, type, id, filteredClusters, clusterProps}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    filteredClusters: Set<number>,
    clusterProps: ClustersProperties
}) {
    const {data} = useClustersTotals(jobId, type, id, {...clusterProps, clusterIds: [...filteredClusters]}, true);
    return data.total.toLocaleString('en');
}

function SelectAllButton({jobId, type, id, filteredClusters, setFilteredClusters, clusterProps}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    filteredClusters: Set<number>,
    setFilteredClusters: (value: Set<number>) => void,
    clusterProps: ClustersProperties
}) {
    const {data} = useClustersTotals(jobId, type, id, {...clusterProps, clusterIds: [...filteredClusters]});
    const allClustersAreSelected = data.cluster_ids.every(id => filteredClusters.has(id));

    function onToggleSelect() {
        const newFilteredClusters = new Set(filteredClusters);
        for (const clusterId of data.cluster_ids) {
            if (allClustersAreSelected)
                newFilteredClusters.delete(clusterId);
            else
                newFilteredClusters.add(clusterId);
        }
        setFilteredClusters(newFilteredClusters);
    }

    return (
        <button onClick={onToggleSelect}>
            <IconCheckbox size="1.3em"/>
            {allClustersAreSelected ? 'Unselect all' : 'Select all'}
        </button>
    );
}
