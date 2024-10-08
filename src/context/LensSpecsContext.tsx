import {createContext, useState, ReactNode} from 'react';
import {LensSpec} from 'utils/interfaces.ts';
import {copy} from 'utils/specifications.ts';

export const LensSpecsContext = createContext<{
    lensSpecs: LensSpec[];
    setLensSpecs: (lensSpecs: LensSpec[]) => void;
} | null>(null);

export function LensSpecsContextProvider({initialLensSpecs, children}: {
    initialLensSpecs: LensSpec[],
    children: ReactNode
}) {
    const copiedLensSpecs = copy(initialLensSpecs);
    const [lensSpecs, setLensSpecs] = useState<LensSpec[]>(copiedLensSpecs);

    return (
        <LensSpecsContext.Provider value={{lensSpecs, setLensSpecs}}>
            {children}
        </LensSpecsContext.Provider>
    );
}
