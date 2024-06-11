import React, { useEffect, useState } from 'react'
import { Slider } from './slider'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Label } from './label'
import { Switch } from './switch'
import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { cn } from '../../lib/utils'

export function Equalizer({
    filterGains,
    setFilterGains,
    filters,
    freqs,
    preampGain,
    setPreampGain,
}: any) {
    const [snapBand, setSnapBand] = useState(false)
    useEffect(() => {
        console.log('Equalizer')
    }, [])
    const changeBands = (num: number[], idx: number) => {
        if (!snapBand) {
            setFilterGains(
                filterGains.map((gain: any, gainIdx: number) => {
                    return idx === gainIdx ? num[0] : gain
                })
            )
        } else {
            setFilterGains(
                filterGains.map((gain: any, gainIdx: number) => {
                    if (idx === gainIdx) {
                        return num[0]
                    } else {
                        let delta = gain
                        let distance = Math.abs(gainIdx - idx)
                        const max_distance = 5
                        if (distance < max_distance) {
                            if (gain < num[0] - distance - max_distance) {
                                delta = gain + (max_distance - distance)
                            } else if (
                                gain >
                                num[0] + distance + max_distance
                            ) {
                                delta = gain - (max_distance - distance)
                            } else {
                                delta = gain
                            }
                        }
                        return Math.round(delta)
                    }
                })
            )
        }
    }
    return (
        <Popover>
            <PopoverTrigger asChild>
                <MixerVerticalIcon className="no-drag h-[24px] cursor-pointer m-0.5 transition-colors hover:text-muted-foreground duration-300" />
            </PopoverTrigger>
            <PopoverContent className="w-[400px] h-[210px] ml-8 bg-background">
                <p className="text-xs text-foreground">Equalizer</p>
                <div className="flex flex-row justify-evenly mt-1">
                    <div
                        key={'filter-gain'}
                        className="flex flex-col items-center w-4"
                    >
                        <p className="text-nano">{preampGain.toString()}</p>
                        <Slider
                            value={[preampGain]}
                            className="no-drag bg-inherit flex-col h-[100px] w-[8px]"
                            min={0}
                            max={1}
                            step={0.1}
                            orientation="vertical"
                            onValueChange={(num) => {
                                setPreampGain(num[0])
                            }}
                        />
                        <p className="text-nano">Preamp</p>
                    </div>
                    <div></div>
                    <div></div>
                    {/* <div className="flex flex-col w-4">
                        <p className="text-nano">Gain</p>
                        <p className="text-nano mt-auto">Freq.</p>
                    </div> */}
                    {filters &&
                        filters.map((filter: any, idx: number) => {
                            return (
                                <div
                                    key={'filter ' + idx}
                                    className="flex flex-col items-center w-4"
                                >
                                    <p className="text-nano">
                                        {filterGains[idx]}
                                    </p>
                                    <Slider
                                        key={idx}
                                        value={[filterGains[idx]]}
                                        className="no-drag bg-inherit flex-col h-[100px] w-[8px]"
                                        min={-12}
                                        max={12}
                                        step={1}
                                        orientation="vertical"
                                        onValueChange={(num) => {
                                            changeBands(num, idx)
                                        }}
                                    />
                                    <p className="text-nano">
                                        {freqs[idx] < 1000
                                            ? freqs[idx]
                                            : freqs[idx] / 1000 + 'k'}
                                    </p>
                                </div>
                            )
                        })}
                </div>
                <div className="flex flex-row mt-1">
                    <div>
                        <Button
                            className={cn(
                                'h-4 w-16 ml-auto cursor-pointer no-drag bg-background text-foreground hover:text-background text-xs'
                            )}
                            size="icon"
                            onClick={() => {
                                setFilterGains([
                                    ...filterGains.map((_: any) => {
                                        return 0
                                    }),
                                ])
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                    <div className="flex items-center mr-0 ml-auto">
                        <Switch
                            id="snap-band"
                            onClick={() => {
                                setSnapBand(!snapBand)
                            }}
                            checked={snapBand}
                        />
                        <Label className="text-xs ml-1">Snap Band</Label>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
