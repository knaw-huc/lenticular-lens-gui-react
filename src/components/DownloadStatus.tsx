import {IconX} from '@tabler/icons-react';
import useDatasets from 'hooks/useDatasets.ts';
import {DatasetRef, EntityType} from 'utils/interfaces.ts';
import classes from './DownloadStatus.module.css';

export default function DownloadStatus({datasetRef, entityType, className, showDownloadButton = true}: {
    datasetRef: DatasetRef,
    entityType: EntityType,
    className?: string,
    showDownloadButton?: boolean
}) {
    const {getDownloadInfo, startDownload} = useDatasets(datasetRef);
    const downloadStatus = getDownloadInfo(entityType!.id);

    return (
        <div className={className}>
            {entityType?.status === 'waiting' && <span className={classes.waiting}>
                Waiting to load entity type metadata
            </span>}

            {entityType?.status === 'running' && <span className={classes.running}>
                Loading entity type metadata
            </span>}

            {entityType?.status === 'failed' && <span className={classes.failed}>
                <IconX size="1em"/>
                Failed to load entity type metadata
            </span>}

            {entityType?.status === 'finished' && <span className={classes.waiting}>
                Not yet downloaded
                {showDownloadButton && <button onClick={_ => startDownload(entityType!.id)}>
                    Start download
                </button>}
            </span>}

            {entityType?.status === 'downloadable' && !downloadStatus && <span className={classes.success}>
                Preparing to download
            </span>}

            {downloadStatus && downloadStatus.total === downloadStatus.rows_count && <span className={classes.success}>
                Downloaded
            </span>}

            {downloadStatus && downloadStatus.total !== downloadStatus.rows_count && <span className={classes.running}>
                Downloading {downloadStatus.rows_count.toLocaleString('en')} / {downloadStatus.total.toLocaleString('en')}
            </span>}
        </div>
    );
}
