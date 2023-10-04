import React, { useEffect, useState } from 'react'
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Map from './map'
import arraymove from '../lib/util/arraymove'

function Sort({ items, onPlace, onDrag, item, itemProps, parentId, ...extras }) {
    let DOMId = parentId
    let [isDragging, setIsDragging] = useState(false)
    let [tempItems, setTempItems] = useState(items)
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        }
    })
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        }
    })
    const keyboardSensor = useSensor(KeyboardSensor)
    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
    )
    useEffect(() => {
        setTempItems(items)
    }, [items])
    let Child = item
    
    return (
        <DndContext onDragEnd = {onDragEnd} onDragOver = {onDragOver} onDragStart = {onDragStart} sensors = {sensors} collisionDetection = {closestCenter} {...extras}>
            <SortableContext items = {isDragging ? items : tempItems}>
                <Map items = {isDragging ? items : tempItems} callback = {(item, index) => {
                    let itemId = DOMId + '-item' + index; return (
                    <Sortable key = {index} id = {item.id} somethingIsDragging = {isDragging}>
                        <Child item = {item} {...itemProps} parentId = {itemId}/>
                    </Sortable>
                )}}/>
            </SortableContext>
        </DndContext>
    )

    function onDragEnd(event) {
        setIsDragging(false)
        const {active: activeElement, over: overElement} = event
        if (activeElement && overElement && activeElement.id !== overElement.id) {
            let active = items.find(item => item.id === activeElement.id)
            let over = items.find(item => item.id === overElement.id)
            if (onPlace) {
                onPlace(active, over)
            }
        }
    }
    
    function onDragOver(event) {
        const {active: activeElement, over: overElement} = event
        if (activeElement && overElement) {
            if (activeElement.id !== overElement.id) {
                let newItems = tempItems
                let sourceIndex = newItems.map(item => item.id).indexOf(activeElement.id)
                let targetIndex = items.map(item => item.id).indexOf(overElement.id)
                newItems = arraymove(tempItems, sourceIndex, targetIndex)
                setTempItems(newItems)
            }
            else {
                setTempItems(items)
            }
        }
    }

    function onDragStart() {
        setIsDragging(true)
    }
}

export function Sortable({ id, somethingIsDragging, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: id,
        transition: {
            duration: 150,
            easing: 'ease-in-out',
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging && {
            pointerEvents: 'none',
        })
    }

    return React.cloneElement(children, {ref: setNodeRef, ...((somethingIsDragging || somethingIsDragging === null) ? {style: style} : {}), ...(somethingIsDragging !== null ? {somethingIsDragging: somethingIsDragging} : {}), isDragging: isDragging, ...attributes, ...listeners})
}

export default Sort