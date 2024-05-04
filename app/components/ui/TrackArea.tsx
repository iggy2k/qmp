import { Slider } from './slider'

import { ImageIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState, useRef } from 'react'
import { secondsToDhmsShort } from '../../src/helpers'

export function TrackArea({
    currSong,
    trackCoverRef,
    settings,
    downloadCover,
    progress,
    PROGRESS_BAR_PRECISION,
    setProgress,
    setSeek,
    audio,
}: any) {
    const svgRef = useRef<null | any>(null)

    useEffect(() => {
        // Source:
        // https://codepen.io/agorkem/pen/PwyNOg/
        console.log('started')
        let analyser: AnalyserNode | undefined
        let audioContext: AudioContext | undefined
        let sourceNode: MediaElementAudioSourceNode | undefined
        let freqArray: any
        let nextFreqArray: any
        let animation = 0
        let svgNS = svgRef.current.namespaceURI
        let g = document.createElementNS(svgNS, 'g')

        let frame = 0
        let framesToInterpolate = 4
        let magicConst = 1 / framesToInterpolate

        let width = 96
        let height = 32
        let maxHeight = Math.max(height * 0.3, 64)
        let fftSize = 64
        let tilt = 0
        let choke = 80

        if (!(analyser && audioContext && sourceNode)) {
            audioSetup()
        }

        function audioSetup() {
            audioContext = new AudioContext()
            analyser = analyser || audioContext.createAnalyser()
            analyser.minDecibels = -90
            analyser.maxDecibels = -10
            analyser.smoothingTimeConstant = 1.0 //0.75;
            analyser.fftSize = fftSize

            sourceNode = audioContext.createMediaElementSource(audio)
            sourceNode.connect(analyser)
            analyser.connect(audioContext.destination)

            // This way we only apply filter to the analyzer but not the destination
            // var filter = audioContext.createBiquadFilter()
            // sourceNode.connect(filter)
            // filter.connect(analyser)
            // sourceNode.connect(audioContext.destination)
            // filter.type = 'lowpass'
            // filter.frequency.value = 1000

            freqArray = new Uint8Array(analyser.frequencyBinCount)
            nextFreqArray = freqArray
            update()
        }

        function shape(
            g: any,
            freqValue: any,
            freqSequence: any,
            freqCount: any
        ) {
            let freqRatio = freqSequence / freqCount
            let x = (width - tilt * 2) * freqRatio + tilt
            let y = height / 2

            var polyline = document.createElementNS(svgNS, 'polyline')
            let throttledRatio = (freqValue - choke) / (255 - choke)
            // let strokeWidth = (width / freqCount) * throttledRatio + 1
            let strokeWidth = 2
            let throttledY = Math.max(throttledRatio, 0) * maxHeight
            let color = '#000000'

            var loc_x = x - strokeWidth / 2,
                loc_y1 = y - throttledY / 2,
                loc_y2 = y + throttledY / 2,
                x_offset = tilt * throttledRatio

            if (throttledRatio > 0) {
                var point_1 = loc_x - x_offset + ',' + loc_y1,
                    point_2 = loc_x + x_offset + ',' + loc_y2
                var points = [point_1, point_2]
            } else {
                var points = [loc_x + ',' + (y - 1), loc_x + ',' + (y + 1)]
            }

            polyline.setAttribute('stroke-width', strokeWidth.toString())
            polyline.setAttribute('stroke', color)
            polyline.setAttribute('points', points.join(' '))
            g.appendChild(polyline)
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
            g = document.createElementNS(svgNS, 'g')

            frame = (frame + 1) % (framesToInterpolate + 1)

            if (frame === framesToInterpolate) {
                nextFreqArray = new Uint8Array(analyser.frequencyBinCount)
                analyser.getByteTimeDomainData(nextFreqArray)

                for (var i = 0; i < freqArray.length; i++) {
                    var v = freqArray[i]
                    shape(g, v, i + 1, freqArray.length)
                }
            } else {
                for (var i = 0; i < freqArray.length; i++) {
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

            svgRef.current.appendChild(g)
            animation = requestAnimationFrame(update)
        }

        return () => {}
    }, [])

    return (
        <div className="flex">
            <div className="no-drag p-2 pb-0">
                <div className="flex-none w-[48px] h-[48px]">
                    {currSong && currSong.cover ? (
                        <img
                            ref={trackCoverRef}
                            className="no-drag ml-[0.1rem] rounded-lg duration-150 hover:scale-110 hover:shadow-[0_10px_20px_rgba(0,_0,_0,_0.7)] transition-[
                    transition-property: transform, shadow, opacity;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;] 
                    "
                            src={currSong ? currSong.cover : ''}
                            onClick={() => {
                                currSong && settings.downloadCover
                                    ? downloadCover(currSong.cover)
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
                        <ImageIcon className="drag ml-[0.1rem] w-[48px] h-[48px] rounded-[10px]" />
                    )}
                </div>
            </div>
            <div className="ml-1 mt-2 flex-1">
                <div className="flex flex-row">
                    <div>
                        {!currSong ||
                            (currSong && !currSong.file && (
                                <p className="no-drag text-xs">
                                    Track name will be here
                                </p>
                            ))}
                        <p className="no-drag text-xs">
                            {currSong &&
                                currSong.file &&
                                currSong.file
                                    .split('/')
                                    .reverse()[0]
                                    .replace(/\.[^/.]+$/, '')}
                        </p>
                        <div className="drag flex flex-row text-xs">
                            {!currSong ||
                                (currSong && !currSong.file && (
                                    <p>Album name will be here</p>
                                ))}
                            {currSong && currSong.album && (
                                <p>{currSong.album}</p>
                            )}
                        </div>
                    </div>
                    <svg
                        id="svg"
                        className="ml-auto mr-3 bg-white"
                        ref={svgRef}
                    ></svg>
                </div>

                <div className="w-full flex flex-row">
                    <Slider
                        defaultValue={[0]}
                        value={[progress]}
                        className="no-drag bg-inherit w-[calc(100%_-_125px)]"
                        min={0}
                        max={PROGRESS_BAR_PRECISION}
                        step={0.001}
                        onValueChange={(num) => {
                            if (audio) {
                                let userInputProgress = num[0]
                                let userInputTime = Math.trunc(
                                    (userInputProgress /
                                        PROGRESS_BAR_PRECISION) *
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

                    <p className="text-xs mr-2 flex-1 text-right font-light pr-1">
                        {secondsToDhmsShort(audio.currentTime)}
                        &nbsp;/&nbsp;
                        {currSong && secondsToDhmsShort(currSong.duration)}
                    </p>
                </div>
            </div>
        </div>
    )
}
