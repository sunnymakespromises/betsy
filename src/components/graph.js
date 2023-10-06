import React, { memo, useMemo } from 'react'
import _ from 'lodash'
import Map from './map'
import { CircleFill } from 'react-bootstrap-icons'
import { useOdds } from '../hooks/useOdds'
import Text from './text'
import Conditional from './conditional'
import toDate from '../lib/util/toDate'

const Graph = memo(function Graph({ lines, parentId }) {
    let DOMId = parentId + '-graph'
    let bounds = useMemo(() => { 
        let buffer = 0.15
        let xValues = lines.map(line => line.points).map(line => line.map(point => point.x)).flat().sort((a, b) => a - b)
        let xRange = xValues[xValues.length - 1] - xValues[0]
        let xBuffer = (xRange * (buffer / 2))
        let yValues = lines.map(line => line.points).map(line => line.map(point => point.y)).flat().sort((a, b) => a - b)
        let yRange = yValues[yValues.length - 1] - yValues[0]
        let yBuffer = (yRange * (buffer / 2))
        return {
            x: {
                min: xValues[0] - xBuffer,
                max: xValues[xValues.length - 1] + xBuffer,
                range: xRange + (xRange * buffer)
            },
            y: {
                min: yValues[0] - yBuffer,
                max: yValues[yValues.length - 1] + yBuffer,
                range: yRange + (yRange * buffer)
            }
        }
    } , [lines])
    let linesWithPercentages = useMemo(() => {
        return lines.map(line => { return {
            ...line, 
            points: line.points.map((point, i) => { 
                let x = ((point.x - bounds.x.min) / bounds.x.range)
                let y = ((point.y - bounds.y.min ) / bounds.y.range)
                let lineData = {}
                if (line.points[i + 1]) {
                    let nextX = ((line.points[i + 1].x - bounds.x.min) / bounds.x.range)
                    let nextY = ((line.points[i + 1].y - bounds.y.min ) / bounds.y.range)
                    let lineWidth = getHypotenuse(nextY - y, nextX - x)
                    let lineRotation = getTheta(nextY - y, nextX - x)
                    lineData = {
                        line: {
                            left: (x * 100) + '%',
                            bottom: (y * 100) + '%',
                            width: (lineWidth * 100) + '%',
                            rotate: lineRotation + 'deg'
                        }
                    }
                }
                return {
                    x: point.x,
                    xPercentage: (x * 100) + '%',
                    y: point.y,
                    yPercentage: (y * 100) + '%',
                    ...lineData
                }

                function getHypotenuse(a, b) {
                    return Math.sqrt((a*a) + (b*b))
                }

                function getTheta(opposite, adjacent) {
                    return -1 * Math.atan(opposite/adjacent) * (180 / Math.PI)
                }
            }) 
        }})
    }, [lines, bounds])
    let midline = useMemo(() => {
        return {
            value: 2,
            percentage: (((2 - bounds.y.min) / bounds.y.range) * 100) + '%'
        }
    }, [lines, bounds])

    return lines.length > 0 && (
        <div id = {DOMId} className = 'relative w-full aspect-square flex justify-center items-center'>
            <Map items = {linesWithPercentages} callback = {(line, index) => {
                var randomMC = require('random-material-color')
                let color = randomMC.getColor({ shades: ['A200', 'A300'], text: line.name })
                let lineId = DOMId + '-line' + index; return (
                <Line key = {index} line = {line} color = {color} parentId = {lineId}/>
            )}}/>
            <GridLines midline = {midline} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => _.isEqual(b.lines, a.lines))

const Line = memo(function Line({ line, color, parentId }) {
    let DOMId = parentId

    return (
        <Map items = {line.points} callback = {(point, index) => {
            let pointId = DOMId + '-point' + index; return (
            <React.Fragment key = {index}>
                <Point lineName = {line.name} point = {point} color = {color} parentId = {pointId}/>
                {point.line && <div id = {pointId + '-line'} style = {{...point.line, borderColor: color}} className = 'absolute border-t-lg opacity-killed origin-left'/>}
            </React.Fragment>
        )}}/>
    )
}, (b, a) => b.color === a.color && _.isEqual(b.line, a.line))

const Point = memo(function Point({ lineName, point, color, parentId }) {
    const { getOdds } = useOdds()
    let odds = useMemo(() => getOdds(point.y), [point])
    let DOMId = parentId

    return (
        <div id = {DOMId} style = {{ bottom: point.yPercentage, left: point.xPercentage }} className = 'group/point absolute -translate-x-1/2 translate-y-1/2 w-4 h-4 z-10 hover:z-50'>
            <CircleFill id = {DOMId + '-icon'} style = {{ color: color }} className = 'w-full h-full cursor-pointer'/>
            <div id = {DOMId + '-modal'} className = 'transition-all duration-main absolute top-full left-1/2 -translate-x-1/2 max-h-0 group-hover/point:max-h-min flex flex-col items-center gap-xs p-0 group-hover/point:p-base bg-base-highlight rounded-base overflow-hidden shadow-md z-50'>
                <Text id = {DOMId + '-modal-date'} preset = 'subtitle' classes = 'whitespace-nowrap text-text-highlight/killed'>
                    {toDate(point.x)}
                </Text>
                <Text id = {DOMId + '-modal-bet-name'} preset = 'subtitle' classes = 'whitespace-nowrap text-text-highlight/muted'>
                    {lineName}
                </Text>
                <Text id = {DOMId + '-modal-value'} preset = 'title' classes = '!font-bold whitespace-nowrap text-text-highlight'>
                    {odds}
                </Text>
            </div>
        </div>
    )
}, (b, a) => b.lineName === a.lineName && b.color === a.color && _.isEqual(b.point, a.point))


const GridLines = memo(function GridLines({ midline, parentId }) {
    const { getOdds } = useOdds()
    let odds = useMemo(() => getOdds(midline.value), [midline])
    let DOMId = parentId + '-grid'
    let splits = 5

    return (
        <div id = {DOMId} className = 'absolute w-full h-full top-0 left-0'>
            <Map items = {[...Array(splits - 1).keys()].map(key => key + 1)} callback = {(number, index) => {
                let gridLineId = DOMId + '-line' + index; return (
                <React.Fragment key = {index}>
                    <div id = {gridLineId + '-x'} style = {{ left: number * (100 / splits) + '%' }} className = {'absolute top-0 border-divider-highlight/muted border-l-sm h-full'}/>
                    <div id = {gridLineId + '-y'} style = {{ top: number * (100 / splits) + '%' }} className = {'absolute left-0 border-divider-highlight/muted border-t-sm w-full'}/>
                </React.Fragment>
            )}}/>
            <Conditional value = {Number(midline.percentage.replace('%', '')) > 0}>
                <div id = {DOMId + '-midline'} style = {{ bottom: midline.percentage }} className = {'absolute left-0 w-full flex items-center gap-base z-0'}>
                    <div id = {DOMId + '-midline-line0'} className = {'border-primary-main/killed border-t-sm grow'}/>
                    <Text id = {DOMId + '-midline-text'} preset = 'body' classes = '!font-bold text-primary-main/killed'>
                        {odds}
                    </Text>
                    <div id = {DOMId + '-midline-line1'} className = {'border-primary-main/killed border-t-sm grow'}/>
                </div>
            </Conditional>
        </div>
    )
})

export default Graph