import {create} from 'zustand';

interface FilteredClustersStore {
    filteredClusters: Set<number>;
    setFilteredClusters: (filteredClusters: Set<number>) => void;
}

const useFilteredClusters = create<FilteredClustersStore>()((set) => ({
    filteredClusters: new Set<number>(),
    setFilteredClusters: (filteredClusters: Set<number>) => set({filteredClusters: new Set<number>(filteredClusters)}),
}));

export default useFilteredClusters;
