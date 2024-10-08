import {ReactNode} from 'react';
import {Link} from '@tanstack/react-router';
import {ResultItem, Results} from 'components/Results.tsx';
import {useUpdateJob} from 'queries/job.ts';
import {Container} from 'utils/components.tsx';
import {BasicMetadata} from 'utils/interfaces.ts';
import classes from './Specifications.module.css';

export default function Specifications(
    {
        jobId,
        type,
        specifications,
        icon,
        link,
        description,
        createButtonLabel,
        onCreate,
        onDuplicate,
        onDelete,
        cannotDeleteCheck
    }: {
        jobId: string,
        type: 'ets' | 'linkset' | 'lens',
        specifications: BasicMetadata[],
        icon: ReactNode,
        link: string,
        description: ReactNode,
        createButtonLabel: string,
        onCreate: () => void,
        onDuplicate: (index: number) => void,
        onDelete: (index: number) => void,
        cannotDeleteCheck: (id: number) => boolean
    }) {
    const mutation = useUpdateJob(jobId);

    function onActionMutate(doAction: () => void) {
        doAction();
        mutation.mutate();
    }

    return (
        <>
            <Container className={classes.header}>
                <div>
                    <div>
                        {description}
                    </div>

                    <div>
                        <button type="button" name="button" onClick={_ => onActionMutate(onCreate)}>
                            {createButtonLabel}
                        </button>
                    </div>
                </div>
            </Container>

            <Container className={classes.resultsContainer}>
                {specifications.length === 0 && <div className={classes.noResults}>
                    No results
                </div>}

                <Results className={classes.results}>
                    {specifications.map((spec) =>
                        <SpecificationResult key={spec.id}
                                             jobId={jobId}
                                             type={type}
                                             spec={spec}
                                             icon={icon}
                                             link={link}
                                             cannotDelete={cannotDeleteCheck(spec.id)}
                                             onDuplicate={() => onDuplicate(spec.id)}
                                             onDelete={() => onDelete(spec.id)}
                                             onActionMutate={onActionMutate}/>
                    )}
                </Results>
            </Container>
        </>
    );
}

function SpecificationResult({jobId, type, spec, icon, link, cannotDelete, onDuplicate, onDelete, onActionMutate}: {
    jobId: string,
    type: 'ets' | 'linkset' | 'lens',
    spec: BasicMetadata,
    icon: ReactNode,
    link: string,
    cannotDelete: boolean,
    onDuplicate: () => void,
    onDelete: () => void,
    onActionMutate: (doAction: () => void) => void
}) {
    function onDeleteCheck() {
        if (!cannotDelete && confirm(`Are you sure you want to delete this ${type}?`))
            onActionMutate(onDelete);
    }

    return (
        <ResultItem>
            <Link to={link} params={{jobId, id: spec.id.toString()}}>
                <div className={classes.title}>
                    {icon}
                    {spec.label}
                </div>

                <div className={classes.description}>
                    {spec.description}
                </div>
            </Link>

            <button onClick={_ => onActionMutate(onDuplicate)}>
                Duplicate
            </button>

            <button disabled={cannotDelete} onClick={_ => onDeleteCheck()}>
                Delete
            </button>
        </ResultItem>
    );
}