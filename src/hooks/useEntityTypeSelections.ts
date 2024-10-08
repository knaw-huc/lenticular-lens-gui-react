import {useContext} from 'react';
import {EntityTypeSelectionsContext} from 'context/EntityTypeSelectionsContext.tsx';
import {duplicate, findId, updater} from 'utils/specifications.ts';
import {EntityTypeSelection} from 'utils/interfaces.ts';

export default function useEntityTypeSelections() {
    const {entityTypeSelections, setEntityTypeSelections} = useContext(EntityTypeSelectionsContext)!;

    function addNew() {
        setEntityTypeSelections([{
            id: findId(entityTypeSelections),
            created: new Date().toISOString(),
            label: `New Data Selection ${entityTypeSelections.length + 1}`,
            description: '',
            dataset: {
                dataset_id: '',
                collection_id: '',
                timbuctoo_graphql: 'https://repository.goldenagents.org/v5/graphql',
            },
            filter: {
                type: 'and',
                conditions: [],
            },
            limit: -1,
            random: false,
            properties: [['']],
        }, ...entityTypeSelections]);
    }

    function duplicateById(id: number) {
        duplicate(id, entityTypeSelections, {
            id: findId(entityTypeSelections),
            created: new Date().toISOString(),
            label: `Duplicated Data Selection ${entityTypeSelections.length + 1}`,
        }, setEntityTypeSelections);
    }

    function deleteById(id: number) {
        setEntityTypeSelections(entityTypeSelections.filter(res => res.id !== id));
    }

    function update(id: number, updateFn: (entityTypeSelection: EntityTypeSelection) => void) {
        updater(id, entityTypeSelections, updateFn, setEntityTypeSelections);
    }

    return {
        entityTypeSelections,
        addNew,
        duplicateById,
        deleteById,
        update,
        updateEntityTypeSelections: setEntityTypeSelections
    };
}
