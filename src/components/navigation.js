import { memo } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { routes } from '../routes/routes'
import Map from './map'

const Navigation = memo(function Header({ location, currentUser }) {
    let DOMId = 'navigation-'
    if (currentUser) {
        return (
            <div id = {DOMId + 'container'} className = 'group transition-all duration-main w-full md:w-14 h-16 md:h-full flex flex-row md:flex-col justify-between md:justify-start items-center bg-base-main z-10 !animate-duration-150 animate-slideInLeft'>
                <Map array = {routes} callback = {(page, index) => {
                    let isCurrent = '/' + location.pathname.split('/')[1] === page.path.split('?')[0]; return (
                    <Icon key = {index} index = {index} page = {page} isDev = {currentUser.is_dev} isCurrent = {isCurrent} parentId = {DOMId} />
                )}}/>
            </div>
        )
    }
    return null
}, (b, a) => _.isEqual(b.currentUser, a.currentUser) && b.location.pathname === a.location.pathname && b.location.search === a.location.search)

const Icon = memo(function Icon({ index, page, isDev, isCurrent, parentId }) {
    const Icon = page.icon
    let DOMId = parentId + 'icon-' + index + '-'
    if (page.show && (page.is_dev ? isDev : true)) {
        return (
            <Link id = {DOMId + 'container'} to = {page.path} className = {'group/icon transition-all duration-main relative w-full h-full md:h-min md:aspect-square p-main flex justify-center items-center'}>
                <Icon id = {DOMId + 'icon'} title = {page.title} className = {'!w-full !h-full cursor-pointer ' + (isCurrent ? 'text-primary-main' : 'text-text-highlight/killed group-hover/icon:text-primary-main')}/>
            </Link>
        )
    }
}, (b, a) => b.index === a.index && _.isEqual(b.page, a.page) && b.isDev === a.isDev && b.isCurrent === a.isCurrent)

export default Navigation