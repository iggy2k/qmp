import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { invertColor, randomHexColor } from './helpers'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../components/primitives/tabs'
import { Switch } from '../components/primitives/switch'
import { Label } from '../components/primitives/label'
import { Button } from '../components/primitives/button'

import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../components/primitives/tooltip'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/primitives/select'

enum KeysOfSettings {
    'useCover' = 'useCover',
    'movingColors' = 'movingColors',
    'downloadCover' = 'downloadCover',
    'transparentInactive' = 'transparentInactive',
    'bottomBar' = 'bottomBar',
    'framelessWindow' = 'framelessWindow',
}

interface Settings {
    useCover: boolean | undefined
    movingColors: boolean | undefined
    downloadCover: boolean | undefined
    transparentInactive: boolean | undefined
    bottomBar: boolean | undefined
    framelessWindow: boolean | undefined
}

function Settings() {
    const [mediaDevices, setMediaDevices] = useState<object>({})
    const [refrashMediaDevices, setRefreshMediaDevices] = useState(false)
    const [currSinkId, setCurrSinkId] = useState('')

    const [theme, setTheme] = useState('')

    const [background, setBackground] = useState('')
    const [accent, setAccent] = useState('')
    const [text, setText] = useState('')
    const [altText, setAltText] = useState('')
    const [selected, setSelected] = useState('background')
    const [settings, setSettings] = useState<Settings>({
        useCover: undefined,
        movingColors: undefined,
        downloadCover: undefined,
        transparentInactive: undefined,
        bottomBar: undefined,
        framelessWindow: undefined,
    })

    const setRandomColors = () => {
        setBackground(randomHexColor())
        setAccent(randomHexColor())
        setText(randomHexColor())
        setAltText(randomHexColor())
    }

    const setOldUIColors = () => {
        window.Main.send('set-old-ui-colors-tm', {
            background: background,
            accent: accent,
            text: text,
            altText: altText,
        })
    }

    const setAudioOutput = (deviceId: string) => {
        window.Main.send('set-audio-output-tm', deviceId)
    }

    useEffect(() => {
        window.Main.send('get-old-ui-colors-tm', null)
        window.Main.send('get-settings-tm', null)
        window.Main.receive(
            'get-old-ui-colors-fm',
            (UIColors: {
                background: string
                accent: string
                text: string
                altText: string
            }) => {
                setBackground(UIColors.background)
                setAccent(UIColors.accent)
                setText(UIColors.text)
                setAltText(UIColors.altText)
            }
        )
        window.Main.receive('get-audio-output-fm', (sinkId: string) => {
            setCurrSinkId(sinkId)
        })
        window.Main.receive(
            'get-settings-fm',
            (newSettings: {
                useCover: boolean
                movingColors: boolean
                downloadCover: boolean
                transparentInactive: boolean
                bottomBar: boolean
                framelessWindow: boolean
            }) => {
                setSettings(newSettings)
            }
        )
    }, [])
    useEffect(() => {
        const setUIColors = () => {
            window.Main.send('set-ui-colors-tm', {
                background: background,
                accent: accent,
                text: text,
                altText: altText,
            })
        }
        if (
            background !== '' &&
            accent !== '' &&
            text !== '' &&
            altText !== ''
        ) {
            setUIColors()
        }
    }, [background, accent, text, altText])

    useEffect(() => {
        if (
            settings.useCover !== undefined &&
            settings.movingColors !== undefined &&
            settings.downloadCover !== undefined &&
            settings.transparentInactive !== undefined &&
            settings.bottomBar !== undefined &&
            settings.framelessWindow !== undefined
        ) {
            window.Main.send('set-settings-tm', settings)
        }
    }, [settings])

    useEffect(() => {
        if (!navigator.mediaDevices?.enumerateDevices) {
            console.log('enumerateDevices() not supported.')
        } else {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices: MediaDeviceInfo[]) => {
                    devices.forEach((device) => {
                        console.log(
                            `${device.kind}: ${device.label} id = ${device.deviceId}`
                        )
                        if (
                            device.kind == 'audiooutput' &&
                            !Object.keys(mediaDevices).includes(device.deviceId)
                        ) {
                            setMediaDevices((mediaDevices) => ({
                                ...mediaDevices,
                                [device.deviceId]: device.label,
                            }))
                        }
                    })
                })
                .catch((err) => {
                    console.error(`${err.name}: ${err.message}`)
                })
        }
    }, [refrashMediaDevices, mediaDevices])

    useEffect(() => {
        console.log(mediaDevices)
    }, [mediaDevices])

    const featuresToggles = [
        {
            display: 'Use cover for track colors',
            codename: KeysOfSettings.useCover,
            needsRestart: false,
        },
        {
            display: 'Moving track colors',
            codename: KeysOfSettings.movingColors,
            needsRestart: false,
        },
        {
            display: 'Click cover to download',
            codename: KeysOfSettings.downloadCover,
            needsRestart: false,
        },
        {
            display: 'Transparency when inactive',
            codename: KeysOfSettings.transparentInactive,
            needsRestart: true,
        },
        {
            display: 'Bottom information bar',
            codename: KeysOfSettings.bottomBar,
            needsRestart: false,
        },
        {
            display: 'Frameless window',
            codename: KeysOfSettings.framelessWindow,
            needsRestart: true,
        },
    ]

    return (
        <div
            className={`${theme} drag h-[100vh] w-full overflow-hidden bg-background text-foreground`}
        >
            <Tabs defaultValue="Features" className="w-full ">
                <TabsList className="w-full rounded-none ">
                    <TabsTrigger className="w-1/3" value="Features">
                        Features
                    </TabsTrigger>
                    <TabsTrigger className="w-1/3" value="Theme">
                        Theme
                    </TabsTrigger>
                    <TabsTrigger className="w-1/3" value="Audio">
                        Audio
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="Features">
                    <div className="auto-cols-2 m-1 grid grid-flow-col  p-1 pb-9 transition-opacity">
                        <div className="no-drag flex flex-col space-y-1 p-2">
                            {featuresToggles.map(
                                (feature: {
                                    display: string
                                    codename: KeysOfSettings
                                    needsRestart: boolean
                                }) => {
                                    return (
                                        <div
                                            key={feature.codename}
                                            className="flex items-center space-x-2"
                                        >
                                            <Switch
                                                id="ause-cover"
                                                onClick={() => {
                                                    const oldSettings = {
                                                        ...settings,
                                                    }

                                                    oldSettings[
                                                        feature.codename
                                                    ] =
                                                        !oldSettings[
                                                            feature.codename
                                                        ]
                                                    setSettings(oldSettings)
                                                }}
                                                checked={
                                                    settings[feature.codename]
                                                }
                                            />
                                            <Label
                                                htmlFor="ause-cover"
                                                className="text-xs"
                                            >
                                                {feature.display}
                                            </Label>
                                            {feature.needsRestart && (
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <ExclamationTriangleIcon className="h-[24px] pt-[0.1rem]" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Requires
                                                                restarting the
                                                                app
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="Theme">
                    <div className=" ml-3 mt-3 flex flex-col gap-3">
                        <Button
                            className="no-drag ml-3 flex h-8 w-32"
                            variant="outline"
                            onClick={() => {
                                setTheme('')
                            }}
                        >
                            White
                            <div className="ml-auto mr-0 h-4 w-4 rounded-full border-2 border-border bg-white"></div>
                        </Button>
                        <Button
                            variant="outline"
                            className="no-drag ml-3 flex h-8 w-32"
                            onClick={() => {
                                setTheme('yellow')
                            }}
                        >
                            Yellow
                            <div className="ml-auto mr-0 h-4 w-4 rounded-full border-2 border-border bg-yellow-400"></div>
                        </Button>
                        <Button
                            variant="outline"
                            className="no-drag ml-3 flex h-8 w-32"
                            onClick={() => {
                                setTheme('red')
                            }}
                        >
                            Red
                            <div className="ml-auto mr-0 h-4 w-4 rounded-full border-2 border-border bg-red-400"></div>
                        </Button>

                        <div className="w-full content-center items-center ">
                            <Button
                                onClick={() => {
                                    setOldUIColors()
                                    alert('Colors will remain after reload.')
                                }}
                                variant="outline"
                                className="no-drag"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="Audio">
                    <div className=" pl-2">
                        <Label htmlFor="source">Audio Source</Label>
                        <div className=" text-sm font-light">
                            <div className="flex gap-x-1">
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={'Select'} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[150px]">
                                        {Object.entries(mediaDevices).map(
                                            ([k, v]) => {
                                                let deviceName = v
                                                    .replace('(Virtual)', '')
                                                    .replace('(Built-in)', '')
                                                    .replace('(Bluetooth)', '')
                                                if (k == 'default') {
                                                    deviceName =
                                                        'Same as system'
                                                }
                                                if (k == currSinkId) {
                                                    deviceName =
                                                        '✓ ' + deviceName
                                                }
                                                return (
                                                    <SelectItem
                                                        value={k}
                                                        key={k}
                                                        className={`mt-1 cursor-pointer`}
                                                        onClick={() => {
                                                            setAudioOutput(k)
                                                        }}
                                                    >
                                                        {deviceName}
                                                    </SelectItem>
                                                )
                                            }
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setRefreshMediaDevices(
                                            !refrashMediaDevices
                                        )
                                    }}
                                >
                                    <ReloadIcon className="h-[20px] pb-[0.1rem]" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Settings
