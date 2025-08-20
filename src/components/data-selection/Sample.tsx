import {Suspense, useState} from 'react';
import {IconReload, IconSettings, IconSquareHalf} from '@tabler/icons-react';
import Uri from 'components/Uri.tsx';
import Checkbox from 'components/Checkbox.tsx';
import Property from 'components/Property.tsx';
import Properties from 'components/Properties.tsx';
import {ResultItem, Results} from 'components/Results.tsx';
import {useUpdateJob} from 'queries/job.ts';
import {useResetSamples, useSamples, useSampleTotal} from 'queries/sample.ts';
import useJob from 'hooks/useJob.ts';
import useInfiniteLoading from 'hooks/useInfiniteLoading.ts';
import useEntityTypeSelections from 'stores/useEntityTypeSelections.ts';
import useDataset from 'hooks/useDataset.ts';
import {Spinner, StickyMenu, ButtonGroup, LabelGroup} from 'utils/components.tsx';
import {EntityTypeSelection, Sample as SampleData} from 'utils/interfaces.ts';
import classes from './Sample.module.css';

export default function Sample({jobId, ets}: { jobId: string, ets: EntityTypeSelection }) {
    const [invert, setInvert] = useState(false);

    return (
        <div>
            <Menu jobId={jobId} ets={ets} invert={invert} setInvert={setInvert}/>

            <Suspense fallback={<Spinner/>}>
                <SampleResults jobId={jobId} ets={ets} invert={invert}/>
            </Suspense>
        </div>
    );
}

function Menu({jobId, ets, invert, setInvert}: {
    jobId: string,
    ets: EntityTypeSelection,
    invert: boolean,
    setInvert: (invert: boolean) => void
}) {
    const {hasChanges} = useJob(jobId);
    const mutation = useUpdateJob(jobId);
    const update = useEntityTypeSelections(state => state.update);
    const {entityType} = useDataset(ets.dataset!);
    const {resetSamples} = useResetSamples(jobId, ets.id, invert);
    const [showPropConfig, setShowPropConfig] = useState(false);

    async function saveAndReload() {
        if (hasChanges())
            await mutation.mutateAsync();
        resetSamples();
    }

    return (
        <StickyMenu className={classes.menu}>
            <div className={classes.options}>
                <LabelGroup label="Total" className={classes.totals} inline>
                    <Suspense fallback={<Spinner type="inline"/>}>
                        <SampleTotal jobId={jobId} ets={ets}/>
                    </Suspense>

                    {' / '}

                    {entityType!.total.toLocaleString('en')}
                </LabelGroup>

                <ButtonGroup>
                    <button onClick={_ => setShowPropConfig(prev => !prev)}>
                        <IconSettings size="1.3em"/>
                        {showPropConfig ? 'Hide' : 'Show'} property configuration
                    </button>

                    <Checkbox checked={invert} onCheckedChange={setInvert} asButton>
                        <IconSquareHalf size="1.3em"/>
                        Show filtered out
                    </Checkbox>

                    <button onClick={saveAndReload}>
                        <IconReload size="1.3em"/>
                        Save and reload
                    </button>
                </ButtonGroup>
            </div>

            {showPropConfig &&
                <Properties properties={ets.properties} datasetRef={ets.dataset!}
                            onChange={newProperties => update(ets.id, ets => ets.properties = newProperties)}/>}
        </StickyMenu>
    );
}

function SampleTotal({jobId, ets}: { jobId: string, ets: EntityTypeSelection }) {
    const {data: total} = useSampleTotal(jobId, ets.id);
    return total.toLocaleString('en');
}

function SampleResults({jobId, ets, invert}: { jobId: string, ets: EntityTypeSelection, invert: boolean }) {
    const {data, isLoading, fetchNextPage} = useSamples(jobId, ets.id, invert);
    const {endOfTheListRef} = useInfiniteLoading(fetchNextPage);

    return (
        <>
            {!data.pages.find(page => (page as SampleData[]).length > 0) && <div className={classes.noResults}>
                No results
            </div>}

            <Results>
                {data.pages.map((page, pageNo) =>
                    (page as SampleData[]).map((sample, idx) =>
                        <SampleResultItem key={`${pageNo}_${idx}`} sample={sample}/>))}
            </Results>

            <div ref={endOfTheListRef}>
                {isLoading && <Spinner/>}
            </div>
        </>
    );
}

function SampleResultItem({sample}: { sample: SampleData }) {
    return (
        <ResultItem className={classes.sample}>
            <div className={classes.count}>
                <div>#{sample.count}</div>
            </div>

            <div className={classes.uri}>
                <Uri uri={sample.uri}/>
            </div>

            {sample.properties.length > 0 && <div className={classes.props}>
                {sample.properties.map((sampleProperty, idx) =>
                    <Property key={idx + '_' + sampleProperty.property.join('_')}
                              showLabel
                              readOnly
                              startCollapsed
                              allowCollapse
                              property={sampleProperty.property}
                              values={sampleProperty.values}
                              datasetRef={sampleProperty.dataset}/>
                )}
            </div>}
        </ResultItem>
    );
}