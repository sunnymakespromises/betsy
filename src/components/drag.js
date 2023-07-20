import React, { useState } from 'react'
import { DragOverlay, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core'

export function Drag({ overlay, children, parentId }) {
    const [active, setActive] = useState(null)
    useDndMonitor({
        onDragStart: (item) => setActive(item),
        onDragEnd: () => setActive(null)
    })
    let Overlay = overlay
    let DOMId = parentId
    return (
        <>
            {children}
            <DragOverlay dropAnimation = {null}>
            {active ? (
                <Overlay active = {active.active.data.current} parentId = {DOMId + '-drag-overlay'}/> 
            ): null}
            </DragOverlay>
        </>
    )
}

export function Droppable({ id, children }) {
    const [active, setActive] = useState()
    const {
        setNodeRef,
        isOver
    } = useDroppable({ 
        id: id
    })

    useDndMonitor({
        onDragEnd: (item) => isOver ? setActive(item.active.data.current) : null
    })

    return React.cloneElement(children, { ref: setNodeRef, isOver: isOver, active: active })
}

export function Draggable({ id, data, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging
    } = useDraggable({ 
        id: id,
        data: data
    })

    const classes = isDragging ? 'opacity-killed' : null

    return React.cloneElement(children, {ref: setNodeRef, classes: classes, isDragging: isDragging, ...attributes, ...listeners})
}