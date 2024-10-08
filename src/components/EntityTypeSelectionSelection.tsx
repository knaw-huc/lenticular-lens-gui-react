import useEntityTypeSelections from 'hooks/useEntityTypeSelections.ts';

export default function EntityTypeSelectionSelection({value, onUpdate, disallowed = []}: {
    value: number;
    onUpdate: (value: number) => void;
    disallowed?: number[];
}) {
    const {entityTypeSelections} = useEntityTypeSelections();
    const allowedEntityTypeSelections = entityTypeSelections.filter(ets => !disallowed.includes(ets.id));

    return (
        <select value={value} onChange={e => onUpdate(parseInt(e.target.value))}>
            <option value={-1} disabled>
                Select an entity type
            </option>

            {allowedEntityTypeSelections.map(ets => <option key={ets.id} value={ets.id}>
                {ets.label}
            </option>)}
        </select>
    );
}
