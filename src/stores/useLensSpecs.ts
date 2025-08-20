import {create} from 'zustand';
import useViews from 'stores/useViews.ts';
import {LensSpec} from 'utils/interfaces.ts';
import {duplicate, findId, updater} from 'utils/specifications.ts';

interface LensSpecsStore {
    lensSpecs: LensSpec[];
    addNew: () => void;
    duplicateById: (id: number) => void;
    deleteById: (id: number) => void;
    update: (id: number, updateFn: (lensSpec: LensSpec) => void) => void;
    updateLensSpecs: (lensSpecs: LensSpec[]) => void;
}

const useLensSpecs = create<LensSpecsStore>()((set) => ({
    lensSpecs: [],
    addNew: () => set((state) => ({
        lensSpecs: [{
            id: findId(state.lensSpecs),
            created: new Date().toISOString(),
            label: `Lens ${state.lensSpecs.length + 1}`,
            description: '',
            specs: {
                type: 'union',
                elements: [],
            },
        }, ...state.lensSpecs]
    })),
    duplicateById: (id: number) => set((state) => {
        const newLensSpecId = findId(state.lensSpecs);
        useViews.getState().duplicateByIdAndType(id, 'lens', newLensSpecId);
        return {
            lensSpecs: duplicate(id, state.lensSpecs, {
                id: newLensSpecId,
                created: new Date().toISOString(),
                label: `Duplicated Lens ${state.lensSpecs.length + 1}`,
            })
        };
    }),
    deleteById: (id: number) => set((state) => {
        useViews.getState().deleteByIdAndType(id, 'lens');
        return {
            lensSpecs: state.lensSpecs.filter(res => res.id !== id)
        };
    }),
    update: (id: number, updateFn: (lensSpec: LensSpec) => void) => set((state) => ({
        lensSpecs: updater(id, state.lensSpecs, updateFn)
    })),
    updateLensSpecs: (lensSpecs: LensSpec[]) => set(_ => ({
        lensSpecs
    })),
}));

export default useLensSpecs;
