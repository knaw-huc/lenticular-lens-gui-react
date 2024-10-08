import {createContext, useState, ReactNode} from 'react';
import {View} from 'utils/interfaces.ts';
import {copy} from 'utils/specifications.ts';

export const ViewsContext = createContext<{
    views: View[];
    setViews: (views: View[]) => void;
} | null>(null);

export function ViewsContextProvider({initialViews, children}: {
    initialViews: View[],
    children: ReactNode
}) {
    const copiedViews = copy(initialViews);
    const [views, setViews] = useState<View[]>(copiedViews);

    return (
        <ViewsContext.Provider value={{views, setViews}}>
            {children}
        </ViewsContext.Provider>
    );
}
