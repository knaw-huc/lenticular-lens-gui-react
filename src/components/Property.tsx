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
    IconLetterBSmall, IconArrowNarrowRight, IconAB, IconLetterCSmall
} from '@tabler/icons-react';
import {useDatasets} from 'queries/datasets.ts';
import {startDownload, useDownloads} from 'queries/downloads.ts';
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
    const {data: downloads} = useDownloads();
    const {data} = useDatasets(datasetRef.timbuctoo_graphql);

    const dataset = data[datasetRef.dataset_id];
    const entities = [
        datasetRef.collection_id,
        ...property
            .filter(prop => prop !== stopProperty && prop !== '')
            .filter((_, idx) => idx % 2 === 1)
    ];

    const notDownloaded = entities.filter(entity =>
        ![...downloads.downloading, ...downloads.downloaded].find(downloadInfo =>
            downloadInfo.dataset_id === datasetRef.dataset_id && downloadInfo.collection_id === entity));

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

    function getCollectionOptions(collection: string, property: string, searchValue: string) {
        const s = searchValue.toLowerCase();
        return [stopProperty, ...dataset.collections[collection].properties[property].referencedCollections.filter(collectionId => {
            const collection = dataset.collections[collectionId];

            const optionMatches = (collectionId || '').toLowerCase().indexOf(s) > -1;
            const shortUriMatches = collection && (collection.shortenedUri || '').toLowerCase().indexOf(s) > -1;
            const uriMatches = collection && (collection.uri || '').toLowerCase().indexOf(s) > -1;

            return optionMatches || shortUriMatches || uriMatches;
        })];
    }

    function getPropertyOptions(collection: string, searchValue: string) {
        const s = searchValue.toLowerCase();
        return Object.keys(dataset.collections[collection].properties).filter(propertyId => {
            const property = dataset.collections[collection].properties[propertyId];

            const linksOnlyMatches = !allowLinksOnly || (property &&
                (property.isLink || property.name === 'uri'));
            const optionMatches = (propertyId || '').toLowerCase().indexOf(s) > -1;
            const shortUriMatches = property && (property.shortenedUri || '').toLowerCase().indexOf(s) > -1;
            const uriMatches = property && (property.uri || '').toLowerCase().indexOf(s) > -1;

            return linksOnlyMatches && (optionMatches || shortUriMatches || uriMatches);
        });
    }

    function onPropertyChange(newProperty: (string | null)[], prevProperty: (string | null)[],) {
        if (onChange)
            onChange(newProperty.map(prop => prop || ''), prevProperty.map(prop => prop || ''));
    }

    function getCollectionLabel(collectionId: string) {
        return dataset.collections[collectionId]?.shortenedUri || collectionId;
    }

    function getPropertyLabel(collectionId: string, propertyId: string) {
        const collection = dataset.collections[collectionId];
        return (collection?.properties[propertyId]?.isInverse ? '← ' : '')
            + (collection?.properties[propertyId]?.shortenedUri || propertyId);
    }

    function getCollectionOption(collectionId: string) {
        const collection = collectionId !== stopProperty ? dataset.collections[collectionId] : null;

        return (
            <div className={classes.option}>
                <div className={classes.optionMain}>
                    {collection && getCollectionLabel(collectionId)}

                    {!collection && <span className={classes.optionStop}>Value</span>}

                    {collection?.uri && collection.shortenedUri !== collection.uri && <span>
                        {collection.uri}
                    </span>}

                    {!collection && <span>Do not follow reference</span>}
                </div>

                {collection && <Properties>
                    <div>Entities: {collection.total.toLocaleString('en')}</div>
                    <DownloadStatus graphqlEndpoint={datasetRef.timbuctoo_graphql}
                                    datasetId={datasetRef.dataset_id}
                                    collectionId={collectionId}
                                    showDownloadButton={false}/>
                </Properties>}
            </div>
        );
    }

    function getPropertyOption(collectionId: string, propertyId: string) {
        const property = dataset.collections[collectionId].properties[propertyId];

        return (
            <div className={classes.option}>
                <div className={classes.optionMain}>
                    {getPropertyLabel(collectionId, propertyId)}

                    {property?.uri && property.shortenedUri !== property.uri && <span>
                        {property.uri}
                    </span>}
                </div>

                <Properties>
                    <div>Density: {property.density}%</div>
                    {property.isValueType && <div>Has values</div>}
                    {property.isLink && !property.isInverse && <div>Has links to another collection</div>}
                    {property.isLink && property.isInverse && <div>Has inverted links to another collection</div>}
                </Properties>
            </div>
        );
    }

    async function startDownloading() {
        await Promise.all(notDownloaded.map(async collectionId =>
            startDownload(datasetRef.timbuctoo_graphql, datasetRef.dataset_id, collectionId)));
    }

    return (
        <PropertyPath propertyPath={property.map(prop => prop === '' ? null : prop)}
                      startCollection={datasetRef.collection_id}
                      buttons={buttons}
                      onChange={onPropertyChange}
                      className={classes.property}
                      stopProperty={stopProperty}
                      infoLabels={showLabel ? [
                          dataset.name,
                          dataset.collections[datasetRef.collection_id].shortenedUri
                      ] : undefined}
                      values={values}
                      getCollectionLabel={getCollectionLabel}
                      getPropertyLabel={getPropertyLabel}
                      getCollectionOptions={getCollectionOptions}
                      getPropertyOptions={getPropertyOptions}
                      getCollectionOption={getCollectionOption}
                      getPropertyOption={getPropertyOption}
                      readOnly={readOnly}
                      allowCollapse={allowCollapse}
                      startCollapsed={startCollapsed}
                      doCollapseButtonOverride={doCollapseButtonOverride}
                      undoCollapseButtonOverride={undoCollapseButtonOverride}/>
    );
}

export function PropertyLabel({datasetRef, className}: { datasetRef: DatasetRef, className?: string }) {
    const {data} = useDatasets(datasetRef.timbuctoo_graphql);
    const dataset = data[datasetRef.dataset_id];

    return (
        <PropertyPathLabels className={clsx(classes.property, className)} labels={[
            dataset.name,
            dataset.collections[datasetRef.collection_id].shortenedUri
        ]}/>
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
