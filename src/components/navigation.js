import { memo } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { routes } from '../routes/routes'
import Map from './map'

const Navigation = memo(function Navigation({ location, currentUser }) {
    let DOMId = 'navigation'
    if (currentUser) {
        return (
            <div id = {DOMId} className = 'flex md:flex-col justify-between md:justify-start z-10 !animate-duration-150 animate-slideInLeft'>
                <Map array = {routes.filter(route => route.show && (route.is_dev ? currentUser.is_dev : true))} callback = {(page, index) => {
                    let isCurrent = '/' + location.pathname.split('/')[1] === page.path.split('?')[0]
                    let iconId = DOMId + '-icon' + index; return (
                    <Icon key = {index} path = {page.path} title = {page.title} icon = {page.icon} isCurrent = {isCurrent} parentId = {iconId} />
                )}}/>
            </div>
        )
    }
    return null
}, (b, a) => b.location.pathname === a.location.pathname && b.location.search === a.location.search && _.isEqual(b.currentUser, a.currentUser))

const Icon = memo(function Icon({ path, title, icon, isCurrent, parentId }) {
    const Icon = icon
    let DOMId = parentId
    return (
        <Link id = {DOMId} to = {path} className = {'group/icon w-14 h-14 p-main cursor-pointer'}>
            <Icon id = {DOMId + '-icon'} title = {title} className = {'!transition-colors duration-main !w-full !h-full ' + (isCurrent ? 'text-primary-main' : 'text-text-highlight/killed group-hover/icon:text-primary-main')}/>
        </Link>
    )
})

export default Navigation