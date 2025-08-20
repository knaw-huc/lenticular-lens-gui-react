import {create} from 'zustand';
import {Socket} from 'socket.io-client';
import {disconnectSocket, disconnectJobSocket} from 'queries/socket.ts';
import {Job, BasicJobMetadata} from 'utils/interfaces.ts';

export interface ActiveJobStore {
    globalSocket: Socket | null;
    jobSocket: Socket | null;
    job: BasicJobMetadata | null;
    setJob: (job: Job, socket: Socket) => void;
    leaveJob: () => void;
    setGlobal: (socket: Socket) => void;
    leaveGlobal: () => void;
}

const useActiveJob = create<ActiveJobStore>()((set) => ({
    globalSocket: null,
    jobSocket: null,
    job: null,
    setJob: (job: Job, socket: Socket) => set(state => {
        if (state.jobSocket && state.job?.id !== job.job_id)
            disconnectJobSocket(state.jobSocket);

        return {
            globalSocket: null,
            jobSocket: socket,
            job: {id: job.job_id, title: job.job_title},
        };
    }),
    leaveJob: () => set(state => {
        if (state.jobSocket)
            disconnectJobSocket(state.jobSocket);

        return {
            ...state,
            jobSocket: null,
            job: null,
        };
    }),
    setGlobal: (socket: Socket) => set(state => {
        if (state.globalSocket)
            disconnectSocket(state.globalSocket);

        return {
            ...state,
            globalSocket: socket,
        };
    }),
    leaveGlobal: () => set(state => {
        if (state.globalSocket)
            disconnectSocket(state.globalSocket);

        return {
            ...state,
            globalSocket: null,
        };
    }),
}));

export default useActiveJob;
