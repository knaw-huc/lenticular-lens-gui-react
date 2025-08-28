import {ReactNode} from 'react';
import clsx from 'clsx';
import PropertyPath, {PropertyPathLabels} from '@knaw-huc/property-path-react';
import {
    Icon,
    IconProps,
    IconPlus,
    IconTrash,
    IconDownload,
    IconArrowBarToLeft,
    IconArrowBarToRight,
    IconLetterASmall,
    IconLetterBSmall,
    IconArrowNarrowRight,
    IconAB,
    IconLetterCSmall
} from '@tabler/icons-react';
import useDataset from 'hooks/useDataset.ts';
import useDatasets from 'hooks/useDatasets.ts';
import {useMapping} from 'queries/mapping.ts';
import DownloadStatus from 'components/DownloadStatus.tsx';
import {DatasetRef} from 'utils/interfaces.ts';
import {Properties} from 'utils/components.tsx';
import classes from './Property.module.css';

const stopProperty = '__value__';

export default function Property(
    {
        property,
        datasetRef,
        values,
        showLabel,
        readOnly,
        allowCollapse,
        startCollapsed,
        allowLinksOnly,
        onAdd,
        onRemove,
        onTransformerAdd,
        onTransformerListAdd,
        onChange
    }: {
        property: string[],
        datasetRef: DatasetRef,
        values?: string[],
        showLabel?: boolean,
        readOnly?: boolean,
        allowCollapse?: boolean;
        startCollapsed?: boolean;
        allowLinksOnly?: boolean,
        onAdd?: () => void,
        onRemove?: () => void,
        onTransformerAdd?: () => void,
        onTransformerListAdd?: () => void,
        onChange?: (newProperty: string[], prevProperty: string[]) => void
    }) {
    const {dataset, entityType} = useDataset(datasetRef);
    const {getDownloadInfo, startDownload} = useDatasets(datasetRef);
    const {data: mapping} = useMapping(datasetRef.mapping?.url || datasetRef.mapping?.file?.id || null);

    if (!dataset || !entityType)
        return;

    const entities = [
        entityType.id,
        ...property
            .filter(prop => prop !== stopProperty && prop !== '')
            .filter((_, idx) => idx % 2 === 1)
    ];

    const notDownloaded = entities.filter(entity =>
        dataset.entity_types[entity]?.status === 'finished' && getDownloadInfo(entity) === null);

    const buttons: [ReactNode, string, () => void][] = [];
    onAdd && buttons.push([
        <IconButtonContent Icon={IconPlus} label="Add"/>, 'Add another property', onAdd]);
    onRemove && buttons.push([
        <IconButtonContent Icon={IconTrash} label="Remove"/>, 'Remove this property', onRemove]);
    onTransformerAdd && buttons.push([
        <IconButtonContent Icon={TransformerIcon} label="Add transformer"/>, 'Add transformer', onTransformerAdd]);
    onTransformerListAdd && buttons.push([
        <IconButtonContent Icon={TransformerAllIcon}
                           label="Add transformer for all"/>, 'Add transformer for all', onTransformerListAdd]);
    notDownloaded.length > 0 && buttons.push([
        <IconButtonContent Icon={IconDownload}
                           label="Download required entities"/>, 'Download required entities', startDownloading]);

    const doCollapseButtonOverride = <IconButtonContent Icon={IconArrowBarToLeft} label="Collapse"/>;
    const undoCollapseButtonOverride = <IconButtonContent Icon={IconArrowBarToRight} label="Collapse"/>;

    function getEntityTypeOptions(entityTypeId: string, property: string, searchValue: string) {
        const s = searchValue.toLowerCase();
        return [stopProperty, ...dataset!.entity_types[entityTypeId].properties[property].referenced.filter(entityTypeId => {
            const entityType = dataset!.entity_types[entityTypeId];

            const optionMatches = (entityTypeId || '').toLowerCase().indexOf(s) > -1;
            const shortUriMatches = entityType && (entityType.shortened_uri || '').toLowerCase().indexOf(s) > -1;
            const uriMatches = entityType && (entityType.uri || '').toLowerCase().indexOf(s) > -1;
            const mappingMatches = entityType && mapping &&
                entityType.uri in mapping && mapping[entityType.uri].toLowerCase().indexOf(s) > -1;

            return optionMatches || shortUriMatches || uriMatches || mappingMatches;
        })];
    }

    function getPropertyOptions(entityTypeId: string, searchValue: string) {
        const s = searchValue.toLowerCase();
        return Object.keys(dataset!.entity_types[entityTypeId].properties).filter(propertyId => {
            const property = dataset!.entity_types[entityTypeId].properties[propertyId];

            const linksOnlyMatches = !allowLinksOnly || (property &&
                (property.is_link || property.id === 'uri'));
            if (!linksOnlyMatches)
                return false;

            const optionMatches = (propertyId || '').toLowerCase().indexOf(s) > -1;
            const shortUriMatches = property && (property.shortened_uri || '').toLowerCase().indexOf(s) > -1;
            const uriMatches = property && (property.uri || '').toLowerCase().indexOf(s) > -1;
            const mappingMatches = property && mapping &&
                property.uri in mapping && mapping[property.uri].toLowerCase().indexOf(s) > -1;

            return optionMatches || shortUriMatches || uriMatches || mappingMatches;
        });
    }

    function onPropertyChange(newProperty: (string | null)[], prevProperty: (string | null)[],) {
        if (onChange)
            onChange(newProperty.map(prop => prop || ''), prevProperty.map(prop => prop || ''));
    }

    function getEntityTypeLabel(entityTypeId: string) {
        const entityType = dataset!.entity_types[entityTypeId];
        if (entityType)
            return mapping && entityType.uri in mapping ? mapping[entityType.uri] : entityType.shortened_uri;

        return entityTypeId;
    }

    function getPropertyLabel(entityTypeId: string, propertyId: string) {
        const property = dataset!.entity_types[entityTypeId]?.properties[propertyId];
        if (property)
            return (property.is_inverse ? '← ' : '') +
                (mapping && property.uri in mapping ? mapping[property.uri] : property.shortened_uri);

        return propertyId;
    }

    function getEntityTypeOption(entityTypeId: string) {
        const entityType = entityTypeId !== stopProperty ? dataset!.entity_types[entityTypeId] : null;

        return (
            <div className={classes.option}>
                <div className={classes.optionMain}>
                    {entityType && getEntityTypeLabel(entityTypeId)}
                    {!entityType && <span className={classes.optionStop}>Value</span>}

                    {mapping && entityType && entityType.uri in mapping && <span>
                        {entityType.shortened_uri}
                    </span>}

                    {entityType?.uri && entityType.shortened_uri !== entityType.uri && <span>
                        {entityType.uri}
                    </span>}

                    {!entityType && <span>Do not follow reference</span>}
                </div>

                {entityType && <Properties>
                    <div>Entities: {entityType.total.toLocaleString('en')}</div>
                    <DownloadStatus datasetRef={datasetRef} entityType={entityType} showDownloadButton={false}/>
                </Properties>}
            </div>
        );
    }

    function getPropertyOption(entityTypeId: string, propertyId: string) {
        const property = dataset!.entity_types[entityTypeId].properties[propertyId];

        return (
            <div className={classes.option}>
                <div className={classes.optionMain}>
                    {getPropertyLabel(entityTypeId, propertyId)}

                    {mapping && property && property.uri in mapping && <span>
                        {property.shortened_uri}
                    </span>}

                    {property?.uri && property.shortened_uri !== property.uri && <span>
                        {property.uri}
                    </span>}
                </div>

                <Properties>
                    <div>Density: {+((property.rows_count / entityType!.total) * 100).toFixed(2)}%</div>
                    {property.is_value_type && <div>Has values</div>}
                    {property.is_link && !property.is_inverse && <div>Has links to another collection</div>}
                    {property.is_link && property.is_inverse && <div>Has inverted links to another collection</div>}
                </Properties>
            </div>
        );
    }

    async function startDownloading() {
        await Promise.all(notDownloaded.map(async entityTypeId => startDownload(entityTypeId)));
    }

    return (
        <PropertyPath propertyPath={property.map(prop => prop === '' ? null : prop)}
                      startCollection={entityType.id}
                      buttons={buttons}
                      onChange={onPropertyChange}
                      className={classes.property}
                      stopProperty={stopProperty}
                      infoLabels={showLabel ? [
                          dataset.title,
                          mapping && entityType!.uri in mapping ? mapping[entityType!.uri] : entityType!.shortened_uri
                      ] : undefined}
                      values={values}
                      getCollectionLabel={getEntityTypeLabel}
                      getPropertyLabel={getPropertyLabel}
                      getCollectionOptions={getEntityTypeOptions}
                      getPropertyOptions={getPropertyOptions}
                      getCollectionOption={getEntityTypeOption}
                      getPropertyOption={getPropertyOption}
                      readOnly={readOnly}
                      allowCollapse={allowCollapse}
                      startCollapsed={startCollapsed}
                      doCollapseButtonOverride={doCollapseButtonOverride}
                      undoCollapseButtonOverride={undoCollapseButtonOverride}/>
    );
}

export function PropertyLabel({datasetRef, className}: { datasetRef: DatasetRef, className?: string }) {
    const {dataset, entityType} = useDataset(datasetRef);
    const {data: mapping} = useMapping(datasetRef.mapping?.url || datasetRef.mapping?.file?.id || null);

    const datasetLabel = dataset!.title;
    const entityTypeLabel = mapping && entityType!.uri in mapping
        ? mapping[entityType!.uri] : entityType!.shortened_uri;

    return (
        <PropertyPathLabels className={clsx(classes.property, className)} labels={[datasetLabel, entityTypeLabel]}/>
    );
}

function TransformerIcon(props: IconProps) {
    return (
        <span className={classes.transformerIcon}>
            <IconLetterASmall {...props}/>
            <IconArrowNarrowRight {...props}/>
            <IconLetterBSmall {...props}/>
        </span>
    );
}

function TransformerAllIcon(props: IconProps) {
    return (
        <span className={classes.transformerAllIcon}>
            <IconAB {...props}/>
            <IconArrowNarrowRight {...props}/>
            <IconLetterCSmall {...props}/>
        </span>
    );
}

function IconButtonContent({Icon, label}: { Icon: Icon, label: string }) {
    return (
        <>
            <Icon size="1em"/>
            <span className={classes.iconButtonLabel}>{label}</span>
        </>
    );
}
