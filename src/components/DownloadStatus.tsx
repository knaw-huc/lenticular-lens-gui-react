import useDataset from 'hooks/useDataset.ts';
import {DatasetRef} from 'utils/interfaces.ts';
import classes from './DownloadStatus.module.css';

export default function DownloadStatus({datasetRef, className, showDownloadButton = true}: {
    datasetRef: DatasetRef,
    className?: string,
    showDownloadButton?: boolean
}) {
    const {entityType, getDownloadInfo, startDownload} = useDataset(datasetRef)!;
    const downloadStatus = getDownloadInfo(entityType.id);

    return (
        <div className={className}>
            {downloadStatus === null && <span className={classes.waiting}>
                Not yet downloaded
                {showDownloadButton && <button onClick={_ => startDownload(entityType.id)}>
                    Start download
                </button>}
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
