import { cn } from '../../lib/utils'
import React, { useEffect, useState, useRef } from 'react'

import { CursorTextIcon, Cross1Icon } from '@radix-ui/react-icons'

import { Input } from './input'

import { Badge } from './badge'

export function DirectoryBadge({
    activePlaylists,
    dir,
    openCertainDir,
    allPlaylists,
    index,
    removeDir,
}: any) {
    const [edit, setEdit] = useState(false)
    return (
        <div
            onClick={() => {
                activePlaylists.viewing !== dir && openCertainDir(dir, true)
            }}
            className="no-drag cursor-pointer"
        >
            <Badge
                className={cn(
                    '',
                    {
                        'bg-muted-foreground text-background':
                            activePlaylists.playing == dir,
                    },
                    {
                        'bg-primary text-background':
                            activePlaylists.viewing == dir,
                    }
                )}
                variant={'outline'}
            >
                {edit ? (
                    <Input
                        className="h-4 w-20 text-xs"
                        placeholder={
                            allPlaylists[index] &&
                            allPlaylists[index].split('/').reverse()[0]
                        }
                    />
                ) : (
                    <p>
                        {allPlaylists[index] &&
                            allPlaylists[index].split('/').reverse()[0]}
                    </p>
                )}
                <div className="">
                    <Cross1Icon
                        className="pl-1 inline-block opacity-30 hover:opacity-100 transition-opacity"
                        onClick={(e) => removeDir(e, index)}
                    />
                    <CursorTextIcon
                        className="pl-1 inline-block opacity-30 hover:opacity-100 transition-opacity"
                        onClick={() => {
                            setEdit(!edit)
                        }}
                    />
                </div>
            </Badge>
        </div>
    )
}
