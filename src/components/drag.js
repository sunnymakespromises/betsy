import React, { useLayoutEffect, useState } from 'react'
import { DragOverlay, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core'
import { createPortal } from 'react-dom'

export function Drag({ overlay, children, parentId }) {
    let DOMId = parentId
    const [active, setActive] = useState(null)
    useDndMonitor({
        onDragStart: (item) => setActive(item),
        onDragEnd: () => setActive(null)
    })
    let [containerElement, setContainerElement] = useState()
    useLayoutEffect(() => {
        if (!containerElement && document.getElementById('body')) {
             setContainerElement(document.getElementById('body'))
        }
     }, [])
    let Overlay = overlay

    return (
        <>
            {children}
            {containerElement && createPortal(
                <DragOverlay dropAnimation = {null}>
                {active ? (
                    <Overlay active = {active.active.data.current} parentId = {DOMId + '-drag-overlay'}/> 
                ): null}
                </DragOverlay>
            , containerElement)}
            
        </>
    )
}

export function Droppable({ id, children }) {
    const [dropped, setDropped] = useState()
    const {
        setNodeRef,
        isOver
    } = useDroppable({ 
        id: id
    })

    useDndMonitor({
        onDragEnd: (item) => isOver ? setDropped(item.active.data.current) : null
    })

    return React.cloneElement(children, { ref: setNodeRef, isOver: isOver, dropped: dropped })
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