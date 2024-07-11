import { Slider } from '@/components/primitives/slider'

import { ImageIcon } from '@radix-ui/react-icons'
import React, { useEffect, useRef } from 'react'
import { secondsToDhmsShort } from '@//src/helpers'
import { Track } from '@/src/App'
import { cn } from '@/lib/utils'

export function TrackArea({
    currentSong,
    currentCover,
    trackCoverRef,
    settings,
    downloadCover,
    progress,
    PROGRESS_BAR_PRECISION,
    setProgress,
    setSeek,
    audio,
    analyser,
}: {
    currentSong: Track | null
    currentCover: string
    trackCoverRef: React.MutableRefObject<HTMLImageElement | null>
    settings: {
        useCover: boolean
        movingColors: boolean
        downloadCover: boolean
        transparentInactive: boolean
        bottomBar: boolean
        framelessWindow: boolean
    }
    downloadCover: (b64data: string) => void
    progress: number
    PROGRESS_BAR_PRECISION: number
    setProgress: React.Dispatch<React.SetStateAction<number>>
    setSeek: (time: number) => void
    audio: HTMLAudioElement & {
        setSinkId(deviceId: string): void
        sinkId: string
    }
    analyser: AnalyserNode
}) {
    const svgRef = useRef<SVGSVGElement | null>(null)

    useEffect(() => {
        console.log('TrackArea')
    }, [])

    useEffect(() => {
        // Source:
        // https://codepen.io/agorkem/pen/PwyNOg/

        let nextFreqArray: Uint8Array
        const svgNS = svgRef.current?.namespaceURI
        if (!svgNS) {
            return
        }
        let g = document.createElementNS(svgNS, 'g')

        let frame = 0
        const framesToInterpolate = 4
        const magicConst = 1 / framesToInterpolate
        let animation = 0
        const width = 96
        const height = 32
        const maxHeight = Math.max(height * 0.3, 48)
        const choke = 70

        // audio.addEventListener('canplay', () => {

        // })

        let points: string[]

        const freqArray = new Uint8Array(analyser?.frequencyBinCount || 0)
        nextFreqArray = freqArray
        update()
        function shape(
            g: Element,
            freqValue: number,
            freqSequence: number,
            freqCount: number
        ) {
            const freqRatio = freqSequence / freqCount
            const x = width * freqRatio
            const y = height / 2

            if (!svgNS) {
                return
            }

            const polyline = document.createElementNS(svgNS, 'polyline')
            const throttledRatio = (freqValue - choke) / (255 - choke)
            // let strokeWidth = (width / freqCount) * throttledRatio + 1
            const strokeWidth = 2
            const throttledY = Math.max(throttledRatio, 0) * maxHeight
            const fallback_color = '#000000'

            const loc_x = x - strokeWidth / 2,
                loc_y1 = y - throttledY / 2,
                loc_y2 = y + throttledY / 2,
                x_offset = throttledRatio

            if (throttledRatio > 0) {
                const point_1 = loc_x - x_offset + ',' + loc_y1,
                    point_2 = loc_x + x_offset + ',' + loc_y2
                points = [point_1, point_2]
            } else {
                points = [loc_x + ',' + (y - 1), loc_x + ',' + (y + 1)]
            }
            if (!svgRef.current) {
                return
            }
            polyline.setAttribute('stroke-width', strokeWidth.toString())
            if (getComputedStyle(svgRef.current).getPropertyValue('color')) {
                polyline.setAttribute(
                    'stroke',
                    getComputedStyle(svgRef.current).getPropertyValue('color')
                )
            } else {
                polyline.setAttribute('stroke', fallback_color)
            }
            polyline.setAttribute('points', points.join(' '))
            g && g.appendChild(polyline)
        }

        if (svgRef.current) {
            svgRef.current.setAttribute('width', width + 'px')
            svgRef.current.setAttribute('height', height + 'px')
            svgRef.current.setAttribute(
                'viewBox',
                '0 0 ' + width + ' ' + height
            )
            svgRef.current.appendChild(g)
        }

        function update() {
            if (!analyser) {
                return
            }
            g.remove()
            if (!svgNS) {
                return
            }
            g = document.createElementNS(svgNS, 'g')

            frame = (frame + 1) % (framesToInterpolate + 1)

            if (frame === framesToInterpolate) {
                nextFreqArray = new Uint8Array(analyser.frequencyBinCount)
                analyser.getByteTimeDomainData(nextFreqArray)

                for (let i = 0; i < freqArray.length; i++) {
                    const v = freqArray[i]
                    shape(g, v, i + 1, freqArray.length)
                }
            } else {
                for (let i = 0; i < freqArray.length; i++) {
                    if (freqArray[i] > nextFreqArray[i]) {
                        freqArray[i] -=
                            (freqArray[i] - nextFreqArray[i]) *
                            magicConst *
                            (frame + 1)
                    } else if (freqArray[i] < nextFreqArray[i]) {
                        freqArray[i] +=
                            (nextFreqArray[i] - freqArray[i]) *
                            magicConst *
                            (frame + 1)
                    }
                    shape(g, freqArray[i], i + 1, freqArray.length)
                }
            }

            if (!svgRef.current) {
                return
            }
            svgRef.current.appendChild(g)
            animation = requestAnimationFrame(update)
        }

        return () => {
            // nextFreqArray = new Uint8Array(0)
            update()
            cancelAnimationFrame(animation)
        }
    }, [analyser])

    return (
        <div className="flex">
            <div className="no-drag p-2 pb-0">
                <div className="h-[48px] w-[48px] flex-none">
                    {currentSong && currentSong.cover ? (
                        <img
                            ref={trackCoverRef}
                            className={cn(
                                'no-drag z-50 ml-[0.1rem] w-[48px] transform-gpu cursor-pointer rounded-md border-2 border-primary duration-200 hover:absolute'
                            )}
                            src={
                                currentCover
                                    ? currentCover
                                    : currentSong
                                      ? currentSong.cover
                                      : ''
                            }
                            onClick={() => {
                                currentSong &&
                                currentSong.cover &&
                                settings.downloadCover
                                    ? downloadCover(currentSong.cover)
                                    : null
                            }}
                            alt=""
                            title={
                                settings.downloadCover
                                    ? 'Click to download the cover art'
                                    : ''
                            }
                        />
                    ) : (
                        <ImageIcon className="drag ml-[0.1rem] h-[48px] w-[48px] rounded-[10px] text-primary" />
                    )}
                </div>
            </div>
            <div className="ml-1 mt-2 flex flex-1 flex-col text-foreground ">
                <div className="mr-2">
                    {!currentSong ||
                        (currentSong && !currentSong.file && (
                            <p className="no-drag text-xs">
                                Track name will be here
                            </p>
                        ))}
                    <p className="no-drag w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-xs">
                        {currentSong &&
                            currentSong.file &&
                            currentSong.file
                                .split('/')
                                .reverse()[0]
                                .replace(/\.[^/.]+$/, '')}
                    </p>
                    <div className="no-drag w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-foreground/60">
                        {!currentSong ||
                            (currentSong && !currentSong.file && (
                                <p>Album name will be here</p>
                            ))}
                        {currentSong && currentSong.album && (
                            <p>{currentSong.album}</p>
                        )}
                    </div>
                </div>

                <Slider
                    defaultValue={[0]}
                    value={[progress]}
                    className="no-drag flex-1 bg-inherit pr-2"
                    min={0}
                    max={PROGRESS_BAR_PRECISION}
                    step={0.001}
                    onValueChange={(num) => {
                        if (audio) {
                            const userInputProgress = num[0]
                            const userInputTime = Math.trunc(
                                (userInputProgress / PROGRESS_BAR_PRECISION) *
                                    audio.duration
                            )

                            if (
                                !Number.isNaN(userInputTime) &&
                                userInputTime !== Infinity
                            ) {
                                setProgress(userInputProgress)
                                setSeek(userInputTime)
                            }
                        }
                    }}
                />
            </div>
            <div className="flex-0 w-26 mr-2 mt-2  justify-center align-middle">
                <svg
                    id="svg"
                    // !!! text-primary is referenced to draw visualizer
                    className="mt-1 text-primary"
                    ref={svgRef}
                ></svg>
                <p className="flex-1 pr-1 text-center text-xs font-light text-foreground">
                    {secondsToDhmsShort(audio.currentTime)}
                    &nbsp;/&nbsp;
                    {currentSong && secondsToDhmsShort(currentSong.duration)}
                </p>
            </div>
        </div>
    )
}
