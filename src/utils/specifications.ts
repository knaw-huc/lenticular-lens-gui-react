import {
    BasicRef,
    Linkset,
    LinksetSpec,
    LensSpec,
    LensElements,
    LogicTree,
    MatchingMethods,
    MatchingMethodSpec,
    SpecRef
} from 'utils/interfaces.ts';
import {sNormOptions, tNormOptions} from 'utils/logicBoxOptions.ts';

export function copy<I>(obj: I): I {
    return JSON.parse(JSON.stringify(obj));
}

export function findId(objs: { id: number }[]): number {
    return objs.reduce((largestId, obj) =>
        (obj.id > largestId) ? obj.id : largestId, 0) + 1;
}

export function duplicate<T extends { id: number }>(id: number, objects: T[], props: Partial<T>,
                                                    setObjects: (objects: T[]) => void) {
    const index = objects.findIndex(res => res.id === id);
    const object = objects[index];
    const newObjects = [...objects];
    newObjects.splice(index, 0, {
        ...copy(object),
        ...props
    });
    setObjects(newObjects);
}

export function updater<T extends {
    id: number,
    type?: 'linkset' | 'lens'
}>(id: number, objects: T[], updateFn: (obj: T) => void, setObjects: (objects: T[]) => void, type?: 'linkset' | 'lens') {
    const index = objects.findIndex(res => res.id === id && (!type || type === res.type));
    const object = copy(objects[index]);
    const newObjects = [...objects];
    newObjects[index] = object;

    updateFn(object);
    setObjects(newObjects);
}

export function getRecursiveGroups<K extends string, E extends object, P extends {} = {}>(element: LogicTree<K, E, P> | E, groupName: K): LogicTree<K, E, P>[] {
    if ('type' in element && groupName in element)
        return element[groupName].reduce((acc, element) =>
            acc.concat(getRecursiveGroups(element, groupName)), [element]);
    return [];
}

export function getRecursiveElements<K extends string, E extends object>(element: LogicTree<K, E>, groupName: K): E[] {
    const elements = Array.isArray(element)
        ? element
        : (Array.isArray(element[groupName])
            ? element[groupName]
            : null);

    if (elements)
        return elements.reduce((acc, element) => acc.concat(getRecursiveElements(element, groupName)), []);

    return [element] as E[];
}

export function updateMethodsLogicBoxTypes(conditions: MatchingMethods | MatchingMethodSpec, useFuzzyLogic: boolean) {
    if ('type' in conditions) {
        if (useFuzzyLogic) {
            if (conditions.type === 'and')
                conditions.type = 'minimum_t_norm';
            if (conditions.type === 'or')
                conditions.type = 'maximum_s_norm';

            conditions.threshold = 0;
        }
        else {
            if (conditions.type in tNormOptions)
                conditions.type = 'and';
            if (conditions.type in sNormOptions)
                conditions.type = 'or';

            conditions.threshold = undefined;
        }

        for (const condition of conditions.conditions)
            updateMethodsLogicBoxTypes(condition, useFuzzyLogic);
    }
}

export function updateLensLogicBoxTypes(elements: LensElements | SpecRef, useFuzzyLogic: boolean) {
    if ('elements' in elements) {
        if (useFuzzyLogic && elements.type !== 'difference' && !elements.type.startsWith('in_set')) {
            elements.s_norm = 'maximum_s_norm';
            elements.threshold = 0;
        }
        else {
            elements.s_norm = undefined;
            elements.threshold = undefined;
        }

        for (const element of elements.elements)
            updateLensLogicBoxTypes(element, useFuzzyLogic);
    }
}

export function createNewMatchingCondition(sources: number[], targets: number[]) {
    return {
        method: {
            name: '',
            config: {}
        },
        sim_method: {
            name: null,
            config: {},
            normalized: false
        },
        fuzzy: {
            t_norm: 'minimum_t_norm',
            s_norm: 'maximum_s_norm',
            threshold: 0
        },
        list_matching: {
            threshold: 0,
            is_percentage: false
        },
        sources: {
            properties: sources
                .filter(entityTypeSelection => entityTypeSelection >= 0)
                .reduce((acc, entityTypeSelection) => ({
                    ...acc,
                    [entityTypeSelection]: [{
                        property: [''],
                        transformers: []
                    }]
                }), {}),
            transformers: []
        },
        targets: {
            properties: targets
                .filter(entityTypeSelection => entityTypeSelection >= 0)
                .reduce((acc, entityTypeSelection) => ({
                    ...acc,
                    [entityTypeSelection]: [{
                        property: [''],
                        transformers: []
                    }]
                }), {}),
            transformers: []
        }
    };
}

export function isEntityTypeUsedInLinkset(id: number, linksetSpecs: LinksetSpec[], linksets: Linkset[]) {
    const ids = linksets.map(linkset => linkset.spec_id);
    return linksetSpecs.find(linksetSpec =>
        ids.includes(linksetSpec.id) && (linksetSpec.sources.includes(id) || linksetSpec.targets.includes(id))
    ) !== undefined;
}

export function getLensSpecsInLens(id: number, lensSpecs: LensSpec[]): LensSpec[] {
    const lensSpec = lensSpecs.find(spec => spec.id === id)!;
    const lensesInSpec = (lensSpec: LensSpec): LensSpec[] => getRecursiveElements(lensSpec.specs, 'elements')
        .filter(elem => elem.type === 'lens')
        .flatMap(elem => {
            const elemLensSpec = lensSpecs.find(spec => spec.id === elem.id);
            if (elemLensSpec)
                return [elemLensSpec, ...lensesInSpec(elemLensSpec)];
            return [];
        });

    const lenses = lensesInSpec(lensSpec);
    return [...new Set(lenses)];
}

export function getLinksetSpecsInLens(id: number, linksetSpecs: LinksetSpec[], lensSpecs: LensSpec[]): LinksetSpec[] {
    const lensSpec = lensSpecs.find(spec => spec.id === id)!;
    const linksets = [lensSpec, ...getLensSpecsInLens(id, lensSpecs)].flatMap(lensSpec =>
        getRecursiveElements(lensSpec.specs, 'elements')
            .filter(elem => elem.type === 'linkset')
            .map(elem => linksetSpecs.find(spec => spec.id === elem.id))
            .filter(spec => spec !== undefined));

    return [...new Set(linksets)];
}

export function getSpecsUsedInLenses(lensSpecs: LensSpec[], linksetSpecs: LinksetSpec[]): SpecRef[] {
    const specsInLens = (lensSpec: LensSpec): SpecRef[] =>
        getRecursiveElements(lensSpec.specs, 'elements')
            .flatMap(elem => {
                if (elem.type === 'lens') {
                    const elemLensSpec = lensSpecs.find(spec => spec.id === elem.id);
                    if (elemLensSpec)
                        return [({type: 'lens', id: elemLensSpec.id}), ...specsInLens(elemLensSpec)];
                }
                else if (elem.type === 'linkset') {
                    const elemLinksetSpec = linksetSpecs.find(spec => spec.id === elem.id);
                    if (elemLinksetSpec)
                        return [({type: 'linkset', id: elemLinksetSpec.id})];
                }

                return [];
            });

    const specs = lensSpecs.reduce<SpecRef[]>((acc, lensSpec) => acc.concat(specsInLens(lensSpec)), []);
    return [...new Set(specs)];
}

export function mergeSpecs<T extends BasicRef>(isUpdate: boolean, hasUnsaved: boolean, original: T[], saved: T[], unSaved: T[]): T[] {
    if (!isUpdate && !hasUnsaved)
        return copy(saved);

    if (!isUpdate)
        return copy(unSaved);

    saved = copy(saved);
    const ids = new Set([...saved.map(obj => obj.id), ...unSaved.map(obj => obj.id)]);
    for (const id of ids) {
        const originalObj = original.find(obj => obj.id === id);
        const unSavedObj = unSaved.find(obj => obj.id === id);
        const savedObj = saved.find(obj => obj.id === id);

        if (!unSavedObj) {
            if (originalObj && savedObj!.created === originalObj.created)
                saved.splice(saved.findIndex(obj => obj.id === id), 1);
            continue;
        }

        if (!savedObj) {
            if (!originalObj)
                saved.push(unSavedObj);
            continue;
        }

        // If the two objects have the same creation time,
        // then we can try to find out which one has changed and accept that one
        // If they do not have the same creation time, we'll favor the newer saved one, and we'll lose the unsaved one
        if (unSavedObj.created === savedObj.created) {
            const unSavedHasChanges = !originalObj || JSON.stringify(unSavedObj) !== JSON.stringify(originalObj);
            const savedHasChanges = !originalObj || JSON.stringify(savedObj) !== JSON.stringify(originalObj);

            if ((!unSavedHasChanges && !savedHasChanges) || (!unSavedHasChanges && savedHasChanges))
                continue;

            if (unSavedHasChanges && !savedHasChanges)
                saved[saved.findIndex(obj => obj.id === id)] = unSavedObj;

            // Both have changes: we could try to merge,
            // but we'll accept the saved one, and we'll lose the unsaved changes
        }
    }

    return saved;
}
