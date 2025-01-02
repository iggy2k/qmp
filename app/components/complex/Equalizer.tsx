import { Button } from '@/components/primitives/button'
import { Label } from '@/components/primitives/label'

import React, { useEffect, useState } from 'react'
import { Slider } from '@/components/primitives/slider'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/primitives/popover'

import { Switch } from '@/components/primitives/switch'
import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export function Equalizer({
    filterGains,
    setFilterGains,
    filters,
    freqs,
    preampGain,
    setPreampGain,
}: {
    filterGains: number[]
    setFilterGains: React.Dispatch<React.SetStateAction<number[]>>
    filters: BiquadFilterNode[]
    freqs: number[]
    preampGain: number
    setPreampGain: React.Dispatch<React.SetStateAction<number>>
}) {
    const [snapBand, setSnapBand] = useState(false)
    useEffect(() => {
        console.log('Equalizer')
    }, [])
    const [open, setOpen] = useState(false)

    const changeBands = (num: number[], idx: number) => {
        if (!snapBand) {
            setFilterGains(
                filterGains.map((gain: number, gainIdx: number) => {
                    return idx === gainIdx ? num[0] : gain
                })
            )
        } else {
            setFilterGains(
                filterGains.map((gain: number, gainIdx: number) => {
                    if (idx === gainIdx) {
                        return num[0]
                    } else {
                        let delta = gain
                        const distance = Math.abs(gainIdx - idx)
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
        <Popover open={open}>
            <PopoverTrigger asChild>
                <MixerVerticalIcon
                    className={cn(
                        'no-drag m-0.5 h-[24px] cursor-pointer transition-colors duration-300 hover:text-muted-foreground',
                        { 'text-foreground/30': open }
                    )}
                    onClick={() => {
                        setOpen((open) => !open)
                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="red ml-8 h-[210px] w-[400px] bg-background">
                <p className="text-xs text-foreground">Equalizer</p>
                <div className="mt-1 flex flex-row justify-evenly">
                    <div
                        key={'filter-gain'}
                        className="flex w-4 flex-col items-center"
                    >
                        <p className="text-nano">{preampGain.toString()}</p>
                        <Slider
                            value={[preampGain]}
                            className="no-drag h-[100px] w-[8px] flex-col bg-inherit"
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
                        filters.map((filter: BiquadFilterNode, idx: number) => {
                            return (
                                <div
                                    key={'filter ' + idx}
                                    className="flex w-4 flex-col items-center"
                                >
                                    <p className="text-nano">
                                        {filterGains[idx]}
                                    </p>
                                    <Slider
                                        key={idx}
                                        value={[filterGains[idx]]}
                                        className="no-drag h-[100px] w-[8px] flex-col bg-inherit"
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
                <div className="mt-1 flex flex-row">
                    <div>
                        <Button
                            className={cn(
                                'no-drag ml-auto h-4 w-16 cursor-pointer bg-background text-xs text-foreground hover:text-background'
                            )}
                            size="icon"
                            onClick={() => {
                                setFilterGains([
                                    ...filterGains.map(() => {
                                        return 0
                                    }),
                                ])
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                    <div className="ml-auto mr-0 flex items-center">
                        <Switch
                            id="snap-band"
                            onClick={() => {
                                setSnapBand(!snapBand)
                            }}
                            checked={snapBand}
                        />
                        <Label className="ml-1 text-xs">Snap Band</Label>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
