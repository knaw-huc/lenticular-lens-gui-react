import {Suspense, useState} from 'react';
import {
    IconChartDots3, IconCheck, IconFilter, IconListCheck, IconListDetails, IconPencil, IconQuestionMark, IconRestore,
    IconSortAscendingNumbers, IconSortDescendingNumbers, IconX
} from '@tabler/icons-react';
import Modal from 'components/Modal.tsx';
import Checkbox from 'components/Checkbox.tsx';
import Dropdown from 'components/Dropdown.tsx';
import LogicTree from 'components/LogicTree.tsx';
import {PropertyLabel} from 'components/Property.tsx';
import Properties from 'components/Properties.tsx';
import RangeFilter from 'components/RangeFilter.tsx';
import FilterCondition from 'components/shared/FilterCondition.tsx';
import LinksMotivation from 'components/shared/LinksMotivation.tsx';
import useViews from 'hooks/useViews.ts';
import {useUpdateJob} from 'queries/job.ts';
import {
    LinksProperties,
    useLinksTotals,
    useResetLinks,
    useValidateSelection,
    useMotivateSelection, LinksProps
} from 'queries/links.ts';
import {Filter, LinksTotals, ValidationState, View, ViewFilter, ViewProperty} from 'utils/interfaces.ts';
import {Badge, ButtonGroup, Spinner, StickyMenu} from 'utils/components.tsx';
import classes from './LinksMenu.module.css';

export default function LinksMenu({jobId, type, id, filteredClusters, linksProps, setLinksProps}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    filteredClusters: Set<number>,
    linksProps: LinksProperties,
    setLinksProps: (value: ((prevProps: LinksProperties) => LinksProperties)) => void
}) {
    const props = {...linksProps, clusterIds: [...filteredClusters]};

    function setProp<K extends keyof LinksProperties>(prop: K, value: LinksProperties[K]) {
        setLinksProps(prevProps => ({...prevProps, [prop]: value}));
    }

    return (
        <StickyMenu className={classes.menu}>
            <div>
                <ValidationStateFilters jobId={jobId} type={type} id={id} props={props} setProp={setProp}/>
                <SelectionMutations jobId={jobId} type={type} id={id} props={props}/>
            </div>

            <div>
                <Filters jobId={jobId} type={type} id={id} props={props}/>
                <Similarity props={props} setProp={setProp}/>
            </div>
        </StickyMenu>
    );
}

function ValidationStateFilters({jobId, type, id, props, setProp}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    props: LinksProps,
    setProp: <K extends keyof LinksProperties>(prop: K, value: LinksProperties[K]) => void
}) {
    const Total = ({prop, applyFilters}: { prop: keyof LinksTotals, applyFilters: boolean }) => {
        const {data} = useLinksTotals(jobId, type, id, props, applyFilters);
        return data[prop].toLocaleString('en');
    };

    const TotalUnfiltered = ({prop}: { prop: keyof LinksTotals }) =>
        <Suspense fallback={<Spinner type="inline"/>}><Total prop={prop} applyFilters={false}/></Suspense>;

    const TotalFiltered = ({prop}: { prop: keyof LinksTotals }) =>
        <Suspense fallback={<Spinner type="inline"/>}><Total prop={prop} applyFilters={true}/></Suspense>;

    return (
        <ButtonGroup>
            <Checkbox asButton checked={props.accepted}
                      onCheckedChange={accepted => setProp('accepted', accepted)}>
                Accepted
                <Badge><TotalFiltered prop="accepted"/> / <TotalUnfiltered prop="accepted"/></Badge>
            </Checkbox>

            <Checkbox asButton checked={props.rejected}
                      onCheckedChange={rejected => setProp('rejected', rejected)}>
                Rejected
                <Badge><TotalFiltered prop="rejected"/> / <TotalUnfiltered prop="rejected"/></Badge>
            </Checkbox>

            <Checkbox asButton checked={props.uncertain}
                      onCheckedChange={uncertain => setProp('uncertain', uncertain)}>
                Uncertain
                <Badge><TotalFiltered prop="uncertain"/> / <TotalUnfiltered prop="uncertain"/></Badge>
            </Checkbox>

            <Checkbox asButton checked={props.unchecked}
                      onCheckedChange={unchecked => setProp('unchecked', unchecked)}>
                Unchecked
                <Badge><TotalFiltered prop="unchecked"/> / <TotalUnfiltered prop="unchecked"/></Badge>
            </Checkbox>

            {type === 'lens' && <Checkbox asButton checked={props.disputed}
                                          onCheckedChange={disputed => setProp('disputed', disputed)}>
                Disputed
                <Badge><TotalFiltered prop="disputed"/> / <TotalUnfiltered prop="disputed"/></Badge>
            </Checkbox>}
        </ButtonGroup>
    );
}

function SelectionMutations({jobId, type, id, props}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    props: LinksProps
}) {
    const validateMutation = useValidateSelection(jobId, type, id, props);
    const motivateMutation = useMotivateSelection(jobId, type, id, props);

    function onValidate(validation: ValidationState) {
        validateMutation.mutate({validation});
    }

    function onMotivate(motivation: string) {
        motivateMutation.mutate({motivation});
    }

    return (
        <ButtonGroup>
            <Dropdown trigger={<><IconListCheck size="1.3em"/> Validate selection</>}>
                <ValidateSelection onAccept={() => onValidate('accepted')}
                                   onReject={() => onValidate('rejected')}
                                   onUncertain={() => onValidate('uncertain')}
                                   onUnchecked={() => onValidate('unchecked')}/>
            </Dropdown>

            <Dropdown trigger={<><IconPencil size="1.3em"/> Motivate selection</>}>
                {CloseButton =>
                    <LinksMotivation onSave={onMotivate} CloseButton={CloseButton}/>}
            </Dropdown>
        </ButtonGroup>
    );
}

function Filters({jobId, type, id, props}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    props: LinksProps
}) {
    const {views, update} = useViews();
    const resetLinks = useResetLinks(jobId, type, id, props);
    const mutation = useUpdateJob(jobId);
    const view = views.find(res => res.type === type && res.id === id);

    function updateViewProperties(newProperties: ViewProperty[]) {
        update(id, type, newView => newView.properties = newProperties);
        setTimeout(async () => {
            await mutation.mutateAsync();
            await resetLinks('links_only');
        }, 0);
    }

    function updateViewFilters(newFilters: ViewFilter[]) {
        update(id, type, newView => newView.filters = newFilters);
        setTimeout(async () => {
            await mutation.mutateAsync();
            await resetLinks('filtered');
        }, 0);
    }

    return (
        <ButtonGroup>
            {view && <ViewPropertiesModal view={view} onClose={updateViewProperties}/>}
            {view && <ViewFiltersModal view={view} onClose={updateViewFilters}/>}

            <button onClick={_ => window.location.hash = '#clusters'}>
                <IconChartDots3 size="1.3em"/>
                Filter on clusters <Badge>{props.clusterIds.length.toLocaleString('en')}</Badge>
            </button>
        </ButtonGroup>
    );
}

function ViewPropertiesModal({view, onClose}: { view: View, onClose: (properties: ViewProperty[]) => void }) {
    const [properties, setProperties] = useState(view.properties);

    function onChange(idx: number, newProps: string[][]) {
        const newProperties = [...properties];
        newProperties[idx] = {...newProperties[idx], properties: newProps};
        setProperties(newProperties);
    }

    return (
        <Modal title="Property labels" onClose={() => onClose(properties)} trigger={<button>
            <IconListDetails size="1.3em"/>
            Property labels
        </button>}>
            <div className={classes.modal}>
                {properties.map((datasetProperties, idx) => <div key={idx} className={classes.datasetPart}>
                    <PropertyLabel className={classes.datasetLabel} datasetRef={datasetProperties.dataset}/>

                    <Properties className={classes.datasetProps}
                                properties={datasetProperties.properties}
                                datasetRef={datasetProperties.dataset}
                                onChange={newProperties => onChange(idx, newProperties)}/>
                </div>)}
            </div>
        </Modal>
    );
}

function ViewFiltersModal({view, onClose}: { view: View, onClose: (filters: ViewFilter[]) => void }) {
    const [filters, setFilters] = useState(view.filters);
    const noFilters = view.filters.filter(f => f.filter.conditions.length > 0).length.toLocaleString('en');

    function onChange(idx: number, newFilter: Filter) {
        const newFilters = [...filters];
        newFilters[idx] = {...newFilters[idx], filter: newFilter};
        setFilters(newFilters);
    }

    return (
        <Modal title="Filter on properties" onClose={() => onClose(filters)} trigger={<button>
            <IconFilter size="1.3em"/>
            Filter on properties <Badge>{noFilters}</Badge>
        </button>}>
            <div className={classes.modal}>
                {filters.map((datasetFilters, idx) => <div key={idx} className={classes.datasetPart}>
                    <PropertyLabel className={classes.datasetLabel} datasetRef={datasetFilters.dataset}/>

                    <LogicTree logicTree={datasetFilters.filter}
                               elementsKey="conditions"
                               LeafComponent={props => FilterCondition({
                                   ...props,
                                   dataset: datasetFilters.dataset
                               })}
                               add={() => ({type: '', property: ['']})}
                               onChange={changed => onChange(idx, changed)}/>
                </div>)}
            </div>
        </Modal>
    );
}

function ValidateSelection({onAccept, onReject, onUncertain, onUnchecked}: {
    onAccept: () => void,
    onReject: () => void,
    onUncertain: () => void,
    onUnchecked: () => void
}) {
    return (
        <div className={classes.validation}>
            <button className={classes.accept} onClick={onAccept}>
                <IconCheck size="1.3em"/>
                Accept
            </button>

            <button className={classes.reject} onClick={onReject}>
                <IconX size="1.3em"/>
                Reject
            </button>

            <button className={classes.uncertain} onClick={onUncertain}>
                <IconQuestionMark size="1.3em"/>
                Uncertain
            </button>

            <button className={classes.unchecked} onClick={onUnchecked}>
                <IconRestore size="1.3em"/>
                Unchecked (reset validation)
            </button>
        </div>
    );
}

function Similarity({props, setProp}: {
    props: LinksProps,
    setProp: <K extends keyof LinksProperties>(prop: K, value: LinksProperties[K]) => void
}) {
    return (
        <>
            <ButtonGroup>
                <Checkbox asButton checked={props.sort === 'asc'}
                          onCheckedChange={sortAscending => setProp('sort', sortAscending ? 'asc' : 'desc')}>
                    <IconSortAscendingNumbers size="1.3em"/>
                    Sort asc
                </Checkbox>

                <Checkbox asButton checked={props.sort === 'desc'}
                          onCheckedChange={sortDescending => setProp('sort', sortDescending ? 'desc' : 'asc')}>
                    <IconSortDescendingNumbers size="1.3em"/>
                    Sort desc
                </Checkbox>
            </ButtonGroup>

            <RangeFilter label="Similarity" min={0} max={1} step={0.05}
                         minValue={props.min} maxValue={props.max}
                         onMinChange={min => setProp('min', min)}
                         onMaxChange={max => setProp('max', max)}/>
        </>
    );
}
