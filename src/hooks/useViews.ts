import {useContext} from 'react';
import {ViewsContext} from 'context/ViewsContext.tsx';
import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';
import {copy, updater} from 'utils/specifications.ts';
import {View, ViewFilter, ViewProperty} from 'utils/interfaces.ts';

export default function useViews() {
    const {entityTypeSelections} = useEntityTypeSelections();
    const {views, setViews} = useContext(ViewsContext)!;

    function addNew(id: number, type: 'linkset' | 'lens'): View {
        const newView: View = {
            id,
            created: new Date().toISOString(),
            type,
            properties: [],
            filters: [],
            prefix_mappings: {},
        };
        setViews([newView, ...views]);
        return newView;
    }

    function duplicateByIdAndType(id: number, type: 'linkset' | 'lens', newId: number) {
        const index = views.findIndex(res => res.id === id && res.type === type);
        if (index > -1) {
            const newViews = [...views];
            newViews.splice(index, 0, {
                ...copy(views[index]),
                id: newId
            });
            setViews(newViews);
        }
    }

    function deleteByIdAndType(id: number, type: 'linkset' | 'lens') {
        setViews(views.filter(res => res.id !== id || res.type !== type));
    }

    function update(id: number, type: 'linkset' | 'lens', updateFn: (view: View) => void) {
        updater(id, views, updateFn, setViews, type);
    }

    function updateEts(id: number, type: 'linkset' | 'lens', etsIds: number[] | Set<number>) {
        const viewIdx = views.findIndex(res => res.id === id && res.type === type);
        const view = copy((viewIdx >= 0) ? views[viewIdx] : addNew(id, type));

        if (viewIdx >= 0) {
            const propertiesToRemove: ViewProperty[] = copy(view.properties);
            const filtersToRemove: ViewFilter[] = copy(view.filters);

            for (const etsId of etsIds) {
                const ets = entityTypeSelections.find(ets => ets.id === etsId)!;

                const propsIdx = propertiesToRemove.findIndex(prop =>
                    prop.timbuctoo_graphql === ets.dataset.timbuctoo_graphql &&
                    prop.dataset_id === ets.dataset.dataset_id &&
                    prop.collection_id === ets.dataset.collection_id
                );

                if (propsIdx > -1)
                    propertiesToRemove.splice(propsIdx, 1);

                const filterIdx = filtersToRemove.findIndex(filter =>
                    filter.timbuctoo_graphql === ets.dataset.timbuctoo_graphql &&
                    filter.dataset_id === ets.dataset.dataset_id &&
                    filter.collection_id === ets.dataset.collection_id
                );

                if (filterIdx > -1)
                    filtersToRemove.splice(filterIdx, 1);
            }

            for (const toRemove of propertiesToRemove) {
                const propsIdx = view.properties.findIndex(prop =>
                    prop.timbuctoo_graphql === toRemove.timbuctoo_graphql &&
                    prop.dataset_id === toRemove.dataset_id &&
                    prop.collection_id === toRemove.collection_id
                );

                if (propsIdx > -1)
                    view.properties.splice(propsIdx, 1);
            }

            for (const toRemove of filtersToRemove) {
                const filterIdx = view.filters.findIndex(prop =>
                    prop.timbuctoo_graphql === toRemove.timbuctoo_graphql &&
                    prop.dataset_id === toRemove.dataset_id &&
                    prop.collection_id === toRemove.collection_id
                );

                if (filterIdx > -1)
                    view.filters.splice(filterIdx, 1);
            }
        }

        for (const etsId of etsIds) {
            const ets = entityTypeSelections.find(ets => ets.id === etsId)!;

            const propsIdx = view.properties.findIndex(prop =>
                prop.timbuctoo_graphql === ets.dataset.timbuctoo_graphql &&
                prop.dataset_id === ets.dataset.dataset_id &&
                prop.collection_id === ets.dataset.collection_id
            );

            if (propsIdx < 0)
                view.properties.push({
                    timbuctoo_graphql: ets.dataset.timbuctoo_graphql,
                    dataset_id: ets.dataset.dataset_id,
                    collection_id: ets.dataset.collection_id,
                    properties: [['']]
                });

            const filterIdx = view.filters.findIndex(filter =>
                filter.timbuctoo_graphql === ets.dataset.timbuctoo_graphql &&
                filter.dataset_id === ets.dataset.dataset_id &&
                filter.collection_id === ets.dataset.collection_id
            );

            if (filterIdx < 0)
                view.filters.push({
                    timbuctoo_graphql: ets.dataset.timbuctoo_graphql,
                    dataset_id: ets.dataset.dataset_id,
                    collection_id: ets.dataset.collection_id,
                    filter: {
                        type: 'and',
                        conditions: [],
                    },
                });
        }

        const newViews = [...views];
        if (viewIdx >= 0)
            newViews[viewIdx] = view;
        else
            newViews.push(view);
        setViews(newViews);
    }

    return {
        views,
        duplicateByIdAndType,
        deleteByIdAndType,
        update,
        updateEts,
        updateViews: setViews
    };
}
