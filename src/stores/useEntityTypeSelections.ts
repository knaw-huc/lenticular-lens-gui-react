import {create} from 'zustand';
import {EntityTypeSelection} from 'utils/interfaces.ts';
import {duplicate, findId, updater} from 'utils/specifications.ts';

interface EntityTypeSelectionsStore {
    entityTypeSelections: EntityTypeSelection[];
    addNew: () => void;
    duplicateById: (id: number) => void;
    deleteById: (id: number) => void;
    update: (id: number, updateFn: (entityTypeSelection: EntityTypeSelection) => void) => void;
    updateEntityTypeSelections: (entityTypeSelections: EntityTypeSelection[]) => void;
}

const useEntityTypeSelections = create<EntityTypeSelectionsStore>()((set) => ({
    entityTypeSelections: [],
    addNew: () => set((state) => ({
        entityTypeSelections: [{
            id: findId(state.entityTypeSelections),
            created: new Date().toISOString(),
            label: `New Data Selection ${state.entityTypeSelections.length + 1}`,
            description: '',
            dataset: null,
            filter: {
                type: 'and',
                conditions: [],
            },
            limit: -1,
            random: false,
            properties: [['']],
        }, ...state.entityTypeSelections]
    })),
    duplicateById: (id: number) => set((state) => ({
        entityTypeSelections: duplicate(id, state.entityTypeSelections, {
            id: findId(state.entityTypeSelections),
            created: new Date().toISOString(),
            label: `Duplicated Data Selection ${state.entityTypeSelections.length + 1}`,
        })
    })),
    deleteById: (id: number) => set((state) => ({
        entityTypeSelections: state.entityTypeSelections.filter(res => res.id !== id)
    })),
    update: (id: number, updateFn: (entityTypeSelection: EntityTypeSelection) => void) => set((state) => ({
        entityTypeSelections: updater(id, state.entityTypeSelections, updateFn)
    })),
    updateEntityTypeSelections: (entityTypeSelections: EntityTypeSelection[]) => set(_ => ({
        entityTypeSelections
    })),
}));

export default useEntityTypeSelections;
