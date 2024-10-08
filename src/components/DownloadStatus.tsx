import {startDownload, useDownloads} from 'queries/downloads.ts';
import {Download} from 'utils/interfaces.ts';
import classes from './DownloadStatus.module.css';

export default function DownloadStatus(
    {
        graphqlEndpoint,
        datasetId,
        collectionId,
        className,
        showDownloadButton = true
    }: {
        graphqlEndpoint: string,
        datasetId: string,
        collectionId: string,
        className?: string
        showDownloadButton?: boolean
    }) {
    const findDownload = (download: Download) =>
        download.graphql_endpoint === graphqlEndpoint &&
        download.dataset_id === datasetId &&
        download.collection_id === collectionId;

    const {data} = useDownloads();
    const downloaded = data.downloaded.find(findDownload);
    const downloading = data.downloading.find(findDownload);

    return (
        <div className={className}>
            {!downloaded && !downloading && <span className={classes.waiting}>
                Not yet downloaded
                {showDownloadButton && <button onClick={_ => startDownload(graphqlEndpoint, datasetId, collectionId)}>
                    Start download
                </button>}
            </span>}

            {downloaded && <span className={classes.success}>
                Downloaded
            </span>}

            {downloading && <span className={classes.running}>
                Downloading {downloading.rows_count.toLocaleString('en')} / {downloading.total.toLocaleString('en')}
            </span>}
        </div>
    );
}
