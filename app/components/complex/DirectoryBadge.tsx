import { cn } from '../../lib/utils'
import React, { useEffect, useState, useRef } from 'react'

import { CursorTextIcon, Cross1Icon } from '@radix-ui/react-icons'

import { Input } from '../primitives/input'

import { Badge } from '../primitives/badge'

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
                    'transition-colors duration-200 hover:bg-primary hover:text-primary-foreground',
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
                        className="inline-block pl-1 opacity-30 transition-opacity hover:opacity-100"
                        onClick={(e) => removeDir(e, index)}
                    />
                    <CursorTextIcon
                        className="inline-block pl-1 opacity-30 transition-opacity hover:opacity-100"
                        onClick={() => {
                            setEdit(!edit)
                        }}
                    />
                </div>
            </Badge>
        </div>
    )
}
