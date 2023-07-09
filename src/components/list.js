import { memo } from 'react'
import _ from 'lodash'
import Map from './map'
import Conditional from './conditional'

const List = memo(function List({ items, element, dividers, classes, parentId }) {
    let DOMId = parentId + 'items-'
    return (
        <div id = {DOMId + 'container'} className = {'w-full max-h-full min-h-0 flex flex-col overflow-auto no-scrollbar' + (classes ? ' ' + classes : '')}>
            <Map array = {items} callback = {(item, index) => {
                let itemId = DOMId + 'item-' + index + '-'; return (
                <Item key = {index} item = {item} Element = {element} hasDivider = {dividers && index !== items.length - 1} parentId = {itemId}/>
            )}}/>
        </div>
    )
}, (b, a) => _.isEqual(b.items, a.items) && b.element === a.element && b.dividers === a.dividers && b.classes === a.classes)

const Item = memo(function Item({ item, Element, hasDivider, parentId }) {
    let DOMId = parentId
    return (
        <>
            <Element item = {item} parentId = {DOMId}/>
            <Conditional value = {hasDivider}>
                <div className = 'divider border-t-thin border-divider-main'/>
            </Conditional>
        </>
    )
}, (b, a) => _.isEqual(b.item, a.item) && b.hasDivider === a.hasDivider)

export default List