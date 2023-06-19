import { Link } from 'react-router-dom'
import Text from './text'

export default function Competitor({competitor, classes, textClasses, link = false, image = true}) {
    if (link) {
        return (
            <Link to = {'/competitors?id=' + competitor.id} className = {classes}>
                <Text preset = 'competitor' classes = {textClasses}>{competitor.name}</Text>
            </Link>
        )
    }
    else {
        return (
            <Text preset = 'competitor' classes = {textClasses}>{competitor.name}</Text>
        )
    }
}