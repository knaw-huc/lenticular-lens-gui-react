import {useContext} from 'react';
import {LensSpecsContext} from 'context/LensSpecsContext.tsx';
import {duplicate, findId, updater} from 'utils/specifications.ts';
import {LensSpec} from 'utils/interfaces.ts';
import useViews from 'hooks/useViews.ts';

export default function useLensSpecs() {
    const {lensSpecs, setLensSpecs} = useContext(LensSpecsContext)!;
    const {duplicateByIdAndType: duplicateViewByIdAndType, deleteByIdAndType: deleteViewByIdAndType} = useViews();

    function addNew() {
        setLensSpecs([{
            id: findId(lensSpecs),
            created: new Date().toISOString(),
            label: `Lens ${lensSpecs.length + 1}`,
            description: '',
            specs: {
                type: 'union',
                elements: [],
            },
        }, ...lensSpecs]);
    }

    function duplicateById(id: number) {
        const newLensSpecId = findId(lensSpecs);
        duplicate(id, lensSpecs, {
            id: newLensSpecId,
            created: new Date().toISOString(),
            label: `Duplicated Lens ${lensSpecs.length + 1}`,
        }, setLensSpecs);
        duplicateViewByIdAndType(id, 'lens', newLensSpecId);
    }

    function deleteById(id: number) {
        setLensSpecs(lensSpecs.filter(res => res.id !== id));
        deleteViewByIdAndType(id, 'lens');
    }

    function update(id: number, updateFn: (lensSpec: LensSpec) => void) {
        updater(id, lensSpecs, updateFn, setLensSpecs);
    }

    return {
        lensSpecs,
        addNew,
        duplicateById,
        deleteById,
        update,
        updateLensSpecs: setLensSpecs
    };
}
