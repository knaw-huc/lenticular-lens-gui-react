import {create} from 'zustand';
import useViews from 'stores/useViews.ts';
import {LinksetSpec} from 'utils/interfaces.ts';
import {duplicate, findId, updater} from 'utils/specifications.ts';

interface LinksetSpecsStore {
    linksetSpecs: LinksetSpec[];
    addNew: () => void;
    duplicateById: (id: number) => void;
    deleteById: (id: number) => void;
    update: (id: number, updateFn: (linksetSpec: LinksetSpec) => void) => void;
    updateLinksetSpecs: (linksetSpecs: LinksetSpec[]) => void;
}

const useLinksetSpecs = create<LinksetSpecsStore>()((set) => ({
    linksetSpecs: [],
    addNew: () => set((state) => ({
        linksetSpecs: [{
            id: findId(state.linksetSpecs),
            created: new Date().toISOString(),
            label: `Linkset ${state.linksetSpecs.length + 1}`,
            description: '',
            use_counter: true,
            sources: [],
            targets: [],
            methods: {
                type: 'and',
                conditions: [],
            },
        }, ...state.linksetSpecs]
    })),
    duplicateById: (id: number) => set((state) => {
        const newLinksetSpecId = findId(state.linksetSpecs);
        useViews.getState().duplicateByIdAndType(id, 'linkset', newLinksetSpecId);
        return {
            linksetSpecs: duplicate(id, state.linksetSpecs, {
                id: newLinksetSpecId,
                created: new Date().toISOString(),
                label: `Duplicated Linkset ${state.linksetSpecs.length + 1}`,
            })
        };
    }),
    deleteById: (id: number) => set((state) => {
        useViews.getState().deleteByIdAndType(id, 'linkset');
        return {
            linksetSpecs: state.linksetSpecs.filter(res => res.id !== id)
        };
    }),
    update: (id: number, updateFn: (linksetSpecs: LinksetSpec) => void) => set((state) => ({
        linksetSpecs: updater(id, state.linksetSpecs, updateFn)
    })),
    updateLinksetSpecs: (linksetSpecs: LinksetSpec[]) => set(_ => ({
        linksetSpecs
    })),
}));

export default useLinksetSpecs;

