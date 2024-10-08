import {ReactNode} from 'react';
import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';
import {Container} from 'utils/components.tsx';
import classes from './QuerySateBoudary.module.css';

export default function QueryStateBoundary({children}: { children: ReactNode }) {
    return (
        <QueryErrorResetBoundary>
            {({reset}) => (
                <ErrorBoundary onReset={reset} fallbackRender={({error, resetErrorBoundary}) => (
                    <Container className={classes.error}>
                        <h2>Something went wrong!</h2>

                        <pre>
                            {error.message}
                        </pre>

                        <div>
                            <button onClick={_ => resetErrorBoundary()}>
                                Try again
                            </button>
                        </div>
                    </Container>
                )}>
                    {children}
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
}
