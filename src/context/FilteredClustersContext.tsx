import {createContext, useState, ReactNode} from 'react';

export const FilteredClustersContext = createContext<{
    filteredClusters: Set<number>;
    setFilteredClusters: (filteredClusters: Set<number>) => void;
}>({
    filteredClusters: new Set(),
    setFilteredClusters: () => {}
});

export function FilteredClustersContextProvider({children}: { children: ReactNode }) {
    const [filteredClusters, setFilteredClusters] = useState<Set<number>>(new Set());

    return (
        <FilteredClustersContext.Provider value={{filteredClusters, setFilteredClusters}}>
            {children}
        </FilteredClustersContext.Provider>
    );
}
