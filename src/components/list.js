import { memo } from 'react'
import { CloseRounded } from '@mui/icons-material'
import _ from 'lodash'
import Map from './map'
import Conditional from './conditional'

const List = memo(function List({ items, element, classes, itemClasses, onClick, onRemove, parentId }) {
    let DOMId = parentId + 'items-'
    return (
        <div id = {DOMId + 'container'} className = {'w-full max-h-full flex flex-col rounded-main overflow-hidden ' + (items?.length === 0 ? 'bg-base-highlight/muted' : 'bg-base-highlight') + (classes ? ' ' + classes : '')}>
            <div id = {parentId + 'items'} className = 'w-full h-full overflow-auto no-scrollbar'>
                <Map array = {items} callback = {(item, index) => {
                    let itemId = DOMId + 'item-' + index + '-'; return (
                    <Item key = {index} item = {item} Element = {element} hasDivider = {index !== items.length - 1} onClick = {onClick} onRemove = {onRemove} classes = {itemClasses} parentId = {itemId}/>
                )}}/>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.items, a.items) && _.isEqual(b.element, a.element) && b.classes === a.classes && b.itemClasses === a.itemClasses)

const Item = memo(function Item({ item, Element, hasDivider, onClick, onRemove, classes, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId + 'item'} className = {'relative w-full h-min px-smaller py-small bg-base-highlight border-divider-highlight' + (hasDivider ? ' border-b-thin' : '') + (classes ? ' ' + classes : '')} onClick = {() => onClick ? onClick(item) : null}>
            <Element item = {item} parentId = {DOMId}/>
            <Conditional value = {onRemove}>
                <div id = {DOMId + 'remove-container'} className = 'absolute top-0 right-3 h-full flex flex-col justify-center'>
                    <CloseRounded className = '!w-5 !h-5 text-text-main/muted hover:text-text-main cursor-pointer' onClick = {(e) => {e.stopPropagation(); e.nativeEvent.stopPropagation(); onRemove(item)}}/>
                </div>
            </Conditional>
        </div>
    )
}, (b, a) => _.isEqual(b.item, a.item) && _.isEqual(b.Element, a.Element) && b.hasDivider === a.hasDivider && b.classes === a.classes)

export default List