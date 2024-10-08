import {createContext, useState, ReactNode} from 'react';
import {EntityTypeSelection} from 'utils/interfaces.ts';
import {copy} from 'utils/specifications.ts';

export const EntityTypeSelectionsContext = createContext<{
    entityTypeSelections: EntityTypeSelection[];
    setEntityTypeSelections: (entityTypeSelections: EntityTypeSelection[]) => void;
} | null>(null);

export function EntityTypeSelectionsProvider({initialEntityTypeSelections, children}: {
    initialEntityTypeSelections: EntityTypeSelection[],
    children: ReactNode
}) {
    const copiedEntityTypeSelections = copy(initialEntityTypeSelections);
    const [entityTypeSelections, setEntityTypeSelections] = useState<EntityTypeSelection[]>(copiedEntityTypeSelections);

    return (
        <EntityTypeSelectionsContext.Provider value={{entityTypeSelections, setEntityTypeSelections}}>
            {children}
        </EntityTypeSelectionsContext.Provider>
    );
}
