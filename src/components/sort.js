import React from 'react'
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Sort({ items, onPlace, children }) {
    const mouseSensor = useSensor(MouseSensor)
    const touchSensor = useSensor(TouchSensor)
    const keyboardSensor = useSensor(KeyboardSensor)
    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
    )

    return (
        <DndContext onDragEnd = {onDragEnd} sensors = {sensors}>
            <SortableContext items = {items}>
                {children}
            </SortableContext>
        </DndContext>
    )

    function onDragEnd(event) {
        const {active: activeElement, over: overElement} = event
        if (activeElement && overElement && activeElement.id !== overElement.id) {
            let active = items.find(item => item.id === activeElement.id)
            let over = items.find(item => item.id === overElement.id)
            onPlace(active, over)
        }
    }
}

export function Sortable({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: id
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging && {
            pointerEvents: 'none',
        })
    }

    return React.cloneElement(children, {ref: setNodeRef, style: style, ...attributes, ...listeners})
}

export default Sort