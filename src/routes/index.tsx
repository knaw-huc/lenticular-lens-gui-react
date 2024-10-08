import {useState} from 'react';
import {createFileRoute, Link, useNavigate} from '@tanstack/react-router';
import Modal from 'components/Modal.tsx';
import {Results, ResultItem} from 'components/Results.tsx';
import {useJobs} from 'queries/jobs.ts';
import {useCreateJob, useUpdateJobWithData} from 'queries/job.ts';
import {Container, Form, LabelGroup} from 'utils/components.tsx';
import classes from './index.module.css';

function Index() {
    return (
        <Container className={classes.container}>
            <div className={classes.main}>
                <div className={classes.projectLoadOptions}>
                    <NewProjectPanel/>
                    <LoadByIdPanel/>
                    <LoadByConfigurationPanel/>
                </div>

                <ProjectsPanel/>
            </div>
        </Container>
    );
}

function NewProjectPanel() {
    return (
        <>
            <h2>New project</h2>

            <div className={classes.newLoadProject}>
                <p>Start a new project to reconcile one or more datasets</p>

                <Modal title="New project" trigger={<button>New project</button>}>
                    <NewProject/>
                </Modal>
            </div>
        </>
    );
}

function NewProject() {
    const navigate = useNavigate();
    const mutation = useCreateJob();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    async function createJob() {
        const jobId = await mutation.mutateAsync({
            title: title.trim(),
            description: description.trim()
        });
        return navigate({to: '/$jobId', params: {jobId}});
    }

    return (
        <Form className={classes.newProjectModal}>
            <LabelGroup isForm label="Project name">
               <textarea name="name" value={title}
                         onChange={e => setTitle(e.target.value)}/>
            </LabelGroup>

            <LabelGroup isForm label="Project description">
                <textarea name="description" value={description}
                          onChange={e => setDescription(e.target.value)}/>
            </LabelGroup>

            <button name="button" onClick={createJob}
                    disabled={title.trim().length === 0 || description.trim().length === 0 || !mutation.isIdle}>
                Create project
            </button>
        </Form>
    );
}

function LoadByIdPanel() {
    const navigate = useNavigate();
    const [jobId, setJobId] = useState('');

    return (
        <>
            <h2>Load project by ID</h2>

            <div className={classes.newLoadProject}>
                <p>Or enter your project ID:</p>
                <input type="text" value={jobId}
                       onChange={(e) => setJobId(e.target.value)}/>

                <button onClick={_ => navigate({to: '/$jobId', params: {jobId}})}>
                    Load project
                </button>
            </div>
        </>
    );
}

function LoadByConfigurationPanel() {
    const navigate = useNavigate();
    const createMutation = useCreateJob();
    const updateMutation = useUpdateJobWithData();

    const [file, setFile] = useState<File | null>(null);

    async function onFileUpload() {
        if (file) {
            const jobData = JSON.parse(await file.text());

            if ('job_title' in jobData && 'job_description' in jobData) {
                const jobId = await createMutation.mutateAsync({
                    title: jobData.job_title,
                    description: jobData.job_description
                });

                await updateMutation.mutateAsync({job_id: jobId, ...jobData});

                return navigate({to: '/$jobId', params: {jobId}});
            }
        }
    }

    return (
        <>
            <h2>Load project by configuration</h2>

            <div className={classes.newLoadProject}>
                <p>Or upload a project configuration:</p>
                <input type="file" onChange={e => setFile(e.target.files![0])}/>

                <button onClick={onFileUpload}>
                    Load project
                </button>
            </div>
        </>
    );
}

function ProjectsPanel() {
    const {data} = useJobs();

    return (
        <div className={classes.loadExistingProject}>
            <h2>Projects</h2>

            <Results distinctLines={false} className={classes.existingProjects}>
                {data.map(job => <ResultItem key={job.job_id}>
                    <Link to="/$jobId" params={{jobId: job.job_id}}>
                        <div className={classes.title}>{job.job_title}</div>
                        <div className={classes.description}>{job.job_description}</div>
                    </Link>
                </ResultItem>)}
            </Results>
        </div>
    );
}

export const Route = createFileRoute('/')({component: Index});
