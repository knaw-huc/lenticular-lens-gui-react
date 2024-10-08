import {createContext, useState, ReactNode} from 'react';
import {LinksetSpec} from 'utils/interfaces.ts';
import {copy} from 'utils/specifications.ts';

export const LinksetSpecsContext = createContext<{
    linksetSpecs: LinksetSpec[];
    setLinksetSpecs: (linksetSpecs: LinksetSpec[]) => void;
} | null>(null);

export function LinksetSpecsContextProvider({initialLinksetSpecs, children}: {
    initialLinksetSpecs: LinksetSpec[],
    children: ReactNode
}) {
    const copiedLinksetSpecs = copy(initialLinksetSpecs);
    const [linksetSpecs, setLinksetSpecs] = useState<LinksetSpec[]>(copiedLinksetSpecs);

    return (
        <LinksetSpecsContext.Provider value={{linksetSpecs, setLinksetSpecs}}>
            {children}
        </LinksetSpecsContext.Provider>
    );
}
