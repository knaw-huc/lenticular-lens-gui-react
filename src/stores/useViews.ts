import {create} from 'zustand';
import useEntityTypeSelections from 'stores/useEntityTypeSelections.ts';
import {View, ViewFilter, ViewProperty} from 'utils/interfaces.ts';
import {copy, updater} from 'utils/specifications.ts';

interface ViewsStore {
    views: View[];
    addNew: (id: number, type: 'linkset' | 'lens') => void;
    duplicateByIdAndType: (id: number, type: 'linkset' | 'lens', newId: number) => void;
    deleteByIdAndType: (id: number, type: 'linkset' | 'lens') => void;
    update: (id: number, type: 'linkset' | 'lens', updateFn: (view: View) => void) => void;
    updateEts: (id: number, type: 'linkset' | 'lens', etsIds: number[] | Set<number>) => void;
    updateViews: (views: View[]) => void;
}

const useViews = create<ViewsStore>()((set, get) => ({
    views: [],
    addNew: (id: number, type: 'linkset' | 'lens') => set((state) => ({
        views: [{
            id,
            created: new Date().toISOString(),
            type,
            properties: [],
            filters: [],
            prefix_mappings: {},
        }, ...state.views]
    })),
    duplicateByIdAndType: (id: number, type: 'linkset' | 'lens', newId: number) => set((state) => {
        const index = state.views.findIndex(res => res.id === id && res.type === type);
        if (index > -1) {
            const newViews = [...state.views];
            newViews.splice(index, 0, {
                ...copy(state.views[index]),
                id: newId
            });
            return {
                views: newViews
            };
        }
        return state;
    }),
    deleteByIdAndType: (id: number, type: 'linkset' | 'lens') => set((state) => ({
        views: state.views.filter(res => res.id !== id || res.type !== type)
    })),
    update: (id: number, type: 'linkset' | 'lens', updateFn: (view: View) => void) => set((state) => ({
        views: updater(id, state.views, updateFn, type)
    })),
    updateEts: (id: number, type: 'linkset' | 'lens', etsIds: number[] | Set<number>) => {
        const entityTypeSelections = useEntityTypeSelections.getState().entityTypeSelections;
        const viewIdx = get().views.findIndex(res => res.id === id && res.type === type);
        const viewExists = viewIdx >= 0;
        if (!viewExists) {
            get().addNew(id, type);
        }

        set((state) => {
            const viewIdx = get().views.findIndex(res => res.id === id && res.type === type);
            const view = copy(get().views[viewIdx]);
            if (viewExists) {
                const propertiesToRemove: ViewProperty[] = copy(view.properties);
                const filtersToRemove: ViewFilter[] = copy(view.filters);

                for (const etsId of etsIds) {
                    const ets = entityTypeSelections.find(ets => ets.id === etsId)!;

                    const propsIdx = propertiesToRemove.findIndex(prop =>
                        JSON.stringify(ets.dataset) === JSON.stringify(prop.dataset));

                    if (propsIdx > -1)
                        propertiesToRemove.splice(propsIdx, 1);

                    const filterIdx = filtersToRemove.findIndex(filter =>
                        JSON.stringify(ets.dataset) === JSON.stringify(filter.dataset));

                    if (filterIdx > -1)
                        filtersToRemove.splice(filterIdx, 1);
                }

                for (const toRemove of propertiesToRemove) {
                    const propsIdx = view.properties.findIndex(prop =>
                        JSON.stringify(toRemove.dataset) === JSON.stringify(prop.dataset));

                    if (propsIdx > -1)
                        view.properties.splice(propsIdx, 1);
                }

                for (const toRemove of filtersToRemove) {
                    const filterIdx = view.filters.findIndex(prop =>
                        JSON.stringify(toRemove.dataset) === JSON.stringify(prop.dataset));

                    if (filterIdx > -1)
                        view.filters.splice(filterIdx, 1);
                }
            }

            for (const etsId of etsIds) {
                const ets = entityTypeSelections.find(ets => ets.id === etsId)!;
                if (ets.dataset) {
                    const propsIdx = view.properties.findIndex(prop =>
                        JSON.stringify(ets.dataset) === JSON.stringify(prop.dataset));

                    if (propsIdx < 0)
                        view.properties.push({
                            properties: [['']],
                            dataset: copy(ets.dataset)
                        });

                    const filterIdx = view.filters.findIndex(filter =>
                        JSON.stringify(ets.dataset) === JSON.stringify(filter.dataset));

                    if (filterIdx < 0)
                        view.filters.push({
                            filter: {
                                type: 'and',
                                conditions: [],
                            },
                            dataset: copy(ets.dataset)
                        });
                }
            }

            const newViews = [...state.views];
            newViews[viewIdx] = view;

            return {
                views: newViews
            };
        });
    },
    updateViews: (views: View[]) => set(_ => ({
        views
    })),
}));

export default useViews;
