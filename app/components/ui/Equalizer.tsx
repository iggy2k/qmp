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
}: any) {
    useEffect(() => {
        console.log('Equalizer')
    }, [])
    return (
        <Popover>
            <PopoverTrigger asChild>
                <MixerVerticalIcon className="no-drag h-[24px] m-0.5" />
            </PopoverTrigger>
            <PopoverContent className="w-[400px] h-[220px] ml-8 bg-background">
                <p className="text-xs text-foreground">Equalizer</p>
                <div className="flex flex-row justify-evenly mt-4">
                    <div className="flex flex-col w-4">
                        <p className="text-nano">Gain</p>
                        <p className="text-nano mt-auto">Freq.</p>
                    </div>
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
                                        step={0.1}
                                        orientation="vertical"
                                        onValueChange={(num) => {
                                            setFilterGains(
                                                filterGains.map(
                                                    (
                                                        gain: any,
                                                        gainIdx: number
                                                    ) => {
                                                        return idx === gainIdx
                                                            ? num[0]
                                                            : gain
                                                    }
                                                )
                                            )
                                        }}
                                    />
                                    <p className="text-nano">
                                        {freqs[idx].end < 1000
                                            ? freqs[idx].end
                                            : freqs[idx].end / 1000 + 'k'}
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
                    }}
                >
                    Reset
                </Button>
            </PopoverContent>
        </Popover>
    )
}
