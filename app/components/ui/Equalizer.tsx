import React, { useEffect } from 'react'
import { Slider } from './slider'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Label } from './label'
import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export function Equalizer({
    filterGains,
    setFilterGains,
    filters,
    freqs,
    refreshEq,
    setRefreshEq,
}: any) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <MixerVerticalIcon className="no-drag h-[24px] m-0.5" />
            </PopoverTrigger>
            <PopoverContent className="w-[600px] h-80">
                <div className="flex flex-row justify-evenly mt-4">
                    <div className="flex flex-col w-4">
                        <p className="text-nano">Gain</p>
                        <p className="text-nano mt-auto">Freq.</p>
                    </div>
                    {filters &&
                        filters.map((filter: any, idx: number) => {
                            return (
                                <div
                                    key={'filter ' + idx + refreshEq}
                                    className="flex flex-col items-center w-4"
                                >
                                    <p className="text-nano">
                                        {filterGains[idx]}
                                    </p>
                                    <Slider
                                        defaultValue={[filters[idx].gain.value]}
                                        className="no-drag bg-inherit flex-col h-[100px] w-[8px]"
                                        min={-12}
                                        max={12}
                                        step={0.1}
                                        orientation="vertical"
                                        onValueChange={(num) => {
                                            let newGain = filterGains
                                            newGain[idx] = num[0]
                                            setFilterGains(newGain)
                                        }}
                                    />
                                    <p className="text-nano">
                                        {freqs[idx].end}
                                    </p>
                                </div>
                            )
                        })}
                </div>
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
                        console.log('refreshEq', refreshEq)
                        setRefreshEq(!refreshEq)
                    }}
                >
                    Reset
                </Button>
            </PopoverContent>
        </Popover>
    )
}
