import {ReactNode} from 'react';
import clsx from 'clsx';
import {IconGripVertical} from '@tabler/icons-react';
import {closestCenter, DndContext, DragEndEvent} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import classes from './DraggableList.module.css';

export default function DraggableList<I>({list, className, readOnly = false, onChange, children}: {
    list: I[],
    className?: string,
    readOnly?: boolean,
    onChange: (newList: I[]) => void,
    children: (item: I, index: number) => ReactNode
}) {
    const items = list.map(id => JSON.stringify(id));

    function onReorder({active, over}: DragEndEvent) {
        if (!readOnly && over && active.id !== over.id) {
            const activeIdx = list.findIndex(item => JSON.stringify(item) === active.id);
            const overIdx = list.findIndex(item => JSON.stringify(item) === over.id);
            const newList = arrayMove(list, activeIdx, overIdx);
            onChange(newList);
        }
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={onReorder}>
            <div className={clsx(classes.list, className)}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {list.map((item, idx) =>
                        <DraggableItem key={idx} idx={idx} readOnly={readOnly} item={item} renderItem={children}/>
                    )}
                </SortableContext>
            </div>
        </DndContext>
    );
}

function DraggableItem<I>({idx, item, readOnly, renderItem}: {
    idx: number,
    readOnly: boolean,
    item: I,
    renderItem: (item: I, index: number) => ReactNode
}) {
    const {transform, transition, attributes, listeners, setNodeRef} = useSortable({id: JSON.stringify(item)});
    const style = {transform: CSS.Translate.toString(transform), transition};

    return (
        <div className={classes.item} style={style} ref={setNodeRef} {...attributes}>
            {!readOnly && <IconGripVertical size="1.3em" className={classes.grip} {...listeners}/>}
            {renderItem(item, idx)}
        </div>
    );
}
