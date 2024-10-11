import {createContext, useState, ReactNode} from 'react';
import {BasicJobMetadata, Job, RootContext as RootContextInterface, UserInfo} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

export const RootContext = createContext<RootContextInterface>(undefined!);

export function RootContextProvider({children}: { children: ReactNode }) {
    const [job, setJob] = useState<BasicJobMetadata | null>(null);

    function setLastActiveJob(job: Job | null) {
        setJob(job ? {id: job.job_id, title: job.job_title} : null);
    }

    async function authenticate(callback: (userInfo: UserInfo | null, isAuthEnabled: boolean) => void) {
        const isAuthEnabled = sessionStorage.getItem('ll_isAuthEnabled') !== null
            ? sessionStorage.getItem('ll_isAuthEnabled') === 'true' : true;
        const userInfo: UserInfo | null = sessionStorage.getItem('ll_userInfo') !== null
            ? JSON.parse(sessionStorage.getItem('ll_userInfo')!) : null;

        if (isAuthEnabled && !userInfo) {
            const response = await fetch(`${api}/user_info`);
            const updatedUserInfo: UserInfo | null = response.ok ? await response.json() : null;
            const updatedIsAuthEnabled = response.ok || response.status !== 404;

            sessionStorage.setItem('ll_userInfo', JSON.stringify(updatedUserInfo));
            sessionStorage.setItem('ll_isAuthEnabled', updatedIsAuthEnabled.toString());

            callback(updatedUserInfo, updatedIsAuthEnabled);
        }
        else {
            callback(userInfo, isAuthEnabled);
        }
    }

    return (
        <RootContext.Provider value={{lastActiveJob: job, setLastActiveJob, authenticate}}>
            {children}
        </RootContext.Provider>
    );
}
