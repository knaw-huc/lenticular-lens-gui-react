import {useState} from 'react';
import dayjs from 'dayjs';
import {IconClipboardCopy} from '@tabler/icons-react';
import {createFileRoute} from '@tanstack/react-router';
import {useJob, useUpdateJobMetadata} from 'queries/job.ts';
import {Container, Form, LabelGroup, LinkButton} from 'utils/components.tsx';
import classes from './index.module.css';

function Job() {
    const {jobId} = Route.useParams();
    const {data: job} = useJob(jobId);
    const mutation = useUpdateJobMetadata(jobId);

    const [title, setTitle] = useState(job.job_title);
    const [description, setDescription] = useState(job.job_description);
    const [link, setLink] = useState(job.job_link || '');

    const downloadConfiguration = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
        job_title: job.job_title,
        job_description: job.job_description,
        job_link: job.job_link,
        entity_type_selections: job.entity_type_selections,
        linkset_specs: job.linkset_specs,
        lens_specs: job.lens_specs,
        views: job.views
    }));

    function save() {
        mutation.mutate({
            job_title: title.trim(),
            job_description: description.trim(),
            job_link: link.trim() || null
        });
    }

    return (
        <Container className={classes.container}>
            <Form className={classes.main}>
                <div className={classes.first}>
                    <LabelGroup label="ID" inline className={classes.id}>
                        <span>{jobId}</span>

                        <button title="Copy project ID to clipboard" className={classes.idCopy}
                                onClick={_ => navigator.clipboard.writeText(jobId)}>
                            <IconClipboardCopy size="1.2em"/>
                        </button>
                    </LabelGroup>

                    <div className={classes.dates}>
                        <span><span>Created:</span> {dayjs(job.created_at).format('MMMM D YYYY, HH:mm:ss')}</span>
                        <span><span>Updated:</span> {dayjs(job.updated_at).format('MMMM D YYYY, HH:mm:ss')}</span>
                    </div>
                </div>

                <LabelGroup isForm label="Name">
                    <textarea name="name" value={title}
                              onChange={e => setTitle(e.target.value)}/>
                </LabelGroup>

                <LabelGroup isForm label="Description">
                    <textarea name="description" value={description}
                              onChange={e => setDescription(e.target.value)}/>
                </LabelGroup>

                <LabelGroup isForm label="Link">
                    <input type="text" name="link" value={link}
                           onChange={e => setLink(e.target.value)}/>
                </LabelGroup>

                <div className={classes.buttons}>
                    <button onClick={save}>Update</button>

                    <LinkButton download={jobId + '.json'} href={downloadConfiguration}>
                        Download configuration
                    </LinkButton>
                </div>
            </Form>
        </Container>
    );
}

export const Route = createFileRoute('/$jobId/')({component: Job});
