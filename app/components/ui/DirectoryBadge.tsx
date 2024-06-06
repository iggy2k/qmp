import { cn } from '../../lib/utils'
import React, { useEffect, useState, useRef } from 'react'

import { CursorTextIcon, Cross1Icon } from '@radix-ui/react-icons'

import { Input } from './input'

import { Badge } from './badge'

export function DirectoryBadge({
    swapDirs,
    dir,
    openCertainDir,
    directories,
    index,
    removeDir,
}: any) {
    const [edit, setEdit] = useState(false)
    return (
        <div
            onClick={() => {
                swapDirs[0] !== dir && openCertainDir(dir, true)
            }}
            className="no-drag"
        >
            <Badge
                className={
                    cn()
                    // '',
                    // {
                    //     'bg-foreground text-background': swapDirs[0] == dir,
                    // },
                    // {
                    //     'bg-muted-foreground text-background':
                    //         swapDirs[1] == dir,
                    // }
                }
                variant={'secondary'}
            >
                {edit ? (
                    <Input
                        className="h-4 w-20 text-xs"
                        placeholder={
                            directories[index] &&
                            directories[index].split('/').reverse()[0]
                        }
                    />
                ) : (
                    <p>
                        {directories[index] &&
                            directories[index].split('/').reverse()[0]}
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
