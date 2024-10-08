import {useContext} from 'react';
import {LinksetSpecsContext} from 'context/LinksetSpecsContext.tsx';
import {duplicate, findId, updater} from 'utils/specifications.ts';
import {LinksetSpec} from 'utils/interfaces.ts';
import useViews from 'hooks/useViews.ts';

export default function useLinksetSpecs() {
    const {linksetSpecs, setLinksetSpecs} = useContext(LinksetSpecsContext)!;
    const {duplicateByIdAndType: duplicateViewByIdAndType, deleteByIdAndType: deleteViewByIdAndType} = useViews();

    function addNew() {
        setLinksetSpecs([{
            id: findId(linksetSpecs),
            created: new Date().toISOString(),
            label: `Linkset ${linksetSpecs.length + 1}`,
            description: '',
            use_counter: true,
            sources: [],
            targets: [],
            methods: {
                type: 'and',
                conditions: [],
            },
        }, ...linksetSpecs]);
    }

    function duplicateById(id: number) {
        const newLinksetSpecId = findId(linksetSpecs);
        duplicate(id, linksetSpecs, {
            id: newLinksetSpecId,
            created: new Date().toISOString(),
            label: `Duplicated Linkset ${linksetSpecs.length + 1}`,
        }, setLinksetSpecs);
        duplicateViewByIdAndType(id, 'linkset', newLinksetSpecId);
    }

    function deleteById(id: number) {
        setLinksetSpecs(linksetSpecs.filter(res => res.id !== id));
        deleteViewByIdAndType(id, 'linkset');
    }

    function update(id: number, updateFn: (linksetSpec: LinksetSpec) => void) {
        updater(id, linksetSpecs, updateFn, setLinksetSpecs);
    }

    return {
        linksetSpecs,
        addNew,
        duplicateById,
        deleteById,
        update,
        updateLinksetSpecs: setLinksetSpecs
    };
}
