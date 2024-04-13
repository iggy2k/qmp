import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { invertColor, randomHexColor } from './helpers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'

import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../components/ui/tooltip'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'

function Settings() {
    const [mediaDevices, setMediaDevices] = useState<Object>({})
    const [refrashMediaDevices, setRefreshMediaDevices] = useState(false)
    const [currSinkId, setCurrSinkId] = useState('')

    const [background, setBackground] = useState('')
    const [accent, setAccent] = useState('')
    const [text, setText] = useState('')
    const [altText, setAltText] = useState('')
    const [selected, setSelected] = useState('background')
    const [settings, setSettings] = useState<{
        useCover: boolean | undefined
        movingColors: boolean | undefined
        downloadCover: boolean | undefined
        transparentInactive: boolean | undefined
        bottomBar: boolean | undefined
        framelessWindow: boolean | undefined
    }>({
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

    const setUIColors = () => {
        window.Main.send('set-ui-colors-tm', {
            background: background,
            accent: accent,
            text: text,
            altText: altText,
        })
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
    }, [refrashMediaDevices])

    useEffect(() => {
        console.log(mediaDevices)
    }, [mediaDevices])

    return (
        <div className=" h-[100vh] overflow-hidden drag w-full">
            <Tabs defaultValue="Features" className="w-full ">
                <TabsList className="w-full rounded-none">
                    <TabsTrigger className="w-1/3" value="Features">
                        Features
                    </TabsTrigger>
                    <TabsTrigger className="w-1/3" value="Interface">
                        Interface
                    </TabsTrigger>
                    <TabsTrigger className="w-1/3" value="Audio">
                        Audio
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="Features">
                    <div className="grid grid-flow-col auto-cols-2 transition-opacity m-1 pb-9 p-1">
                        <div className="no-drag flex flex-col p-2 space-y-1">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="ause-cover"
                                    onClick={() => {
                                        let oldSettings = { ...settings }
                                        oldSettings.useCover =
                                            !oldSettings.useCover
                                        setSettings(oldSettings)
                                    }}
                                    checked={settings.useCover}
                                />
                                <Label htmlFor="ause-cover" className="text-xs">
                                    Use cover for track colors
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="move-colors"
                                    onClick={() => {
                                        let oldSettings = { ...settings }
                                        oldSettings.movingColors =
                                            !oldSettings.movingColors
                                        setSettings(oldSettings)
                                    }}
                                    checked={settings.movingColors}
                                />
                                <Label
                                    htmlFor="move-colors"
                                    className="text-xs"
                                >
                                    Moving track colors
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="download-cover"
                                    onClick={() => {
                                        let oldSettings = { ...settings }
                                        oldSettings.downloadCover =
                                            !oldSettings.downloadCover
                                        setSettings(oldSettings)
                                    }}
                                    checked={settings.downloadCover}
                                />
                                <Label
                                    htmlFor="download-cover"
                                    className="text-xs"
                                >
                                    Click cover to download
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="transparent-inactive"
                                    onClick={() => {
                                        let oldSettings = { ...settings }
                                        oldSettings.transparentInactive =
                                            !oldSettings.transparentInactive
                                        setSettings(oldSettings)
                                    }}
                                    checked={settings.transparentInactive}
                                />
                                <Label
                                    htmlFor="transparent-inactive"
                                    className="text-xs"
                                >
                                    Transparency when inactive
                                </Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <ExclamationTriangleIcon className="pt-[0.1rem] h-[24px]" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Requires to restarting the app
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="bottom-bar"
                                    onClick={() => {
                                        let oldSettings = { ...settings }
                                        oldSettings.bottomBar =
                                            !oldSettings.bottomBar
                                        setSettings(oldSettings)
                                    }}
                                    checked={settings.bottomBar}
                                />
                                <Label htmlFor="bottom-bar" className="text-xs">
                                    Bottom information bar
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="frameless"
                                    checked={settings.framelessWindow}
                                    onClick={() => {
                                        let oldSettings = { ...settings }
                                        oldSettings.framelessWindow =
                                            !oldSettings.framelessWindow
                                        setSettings(oldSettings)
                                    }}
                                />
                                <Label htmlFor="frameless" className="text-xs">
                                    Frameless window
                                </Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <ExclamationTriangleIcon className="pt-[0.1rem] h-[24px]" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Requires restarting the app</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="Interface">
                    <div className="rounded-md m-1 p-2 grid grid-flow-row grid-cols-2 place-items-left">
                        <div className="no-drag mt-1 flex flex-row ml-5">
                            <div
                                className={
                                    `w-[35px] h-[20px]` +
                                    (selected == 'background'
                                        ? ` border-2`
                                        : '')
                                }
                                style={{
                                    backgroundColor: `${background}`,
                                    borderColor: `${invertColor(background)}`,
                                }}
                                onClick={() => setSelected('background')}
                            ></div>
                            <div>
                                <p className="ml-4 b-1  font-semi text-sm">
                                    Background
                                </p>
                            </div>
                        </div>
                        <div className="no-drag mt-1 grid grid-flow-col auto-cols-max ml-auto mr-5">
                            <div className="">
                                <p className="mr-4 b-1  font-semi text-sm">
                                    Accent
                                </p>
                            </div>
                            <div
                                className={
                                    `w-[35px] h-[20px]` +
                                    (selected == 'accent' ? ` border-2` : '')
                                }
                                style={{
                                    backgroundColor: `${accent}`,
                                    borderColor: `${invertColor(accent)}`,
                                }}
                                onClick={() => setSelected('accent')}
                            ></div>
                        </div>
                        <div className="no-drag mt-1 grid grid-flow-col auto-cols-max ml-5">
                            <div
                                className={
                                    `w-[35px] h-[20px]` +
                                    (selected == 'text' ? ` border-2` : '')
                                }
                                style={{
                                    backgroundColor: `${text}`,
                                    borderColor: `${invertColor(text)}`,
                                }}
                                onClick={() => setSelected('text')}
                            ></div>
                            <div className="grid grid-flow-col auto-cols-2">
                                <p className="ml-4 b-1  font-semi text-sm">
                                    Text
                                </p>
                            </div>
                        </div>
                        <div className="no-drag mt-1 grid grid-flow-col auto-cols-max ml-auto mr-5">
                            <div className="grid grid-flow-col auto-cols-2">
                                <p className="mr-4 b-1  font-semi text-sm">
                                    Alt text
                                </p>
                            </div>
                            <div
                                className={
                                    `w-[35px] h-[20px]` +
                                    (selected == 'altText' ? ` border-2` : '')
                                }
                                style={{
                                    backgroundColor: `${altText}`,
                                    borderColor: `${invertColor(altText)}`,
                                }}
                                onClick={() => setSelected('altText')}
                            ></div>
                        </div>

                        <div
                            className="grid grid-flow-col grid-cols-2 my-4 ml-5
max-h-[110px]"
                        >
                            <HexColorPicker
                                className="no-drag max-h-[120px] max-w-[240px]"
                                color={
                                    selected == 'background'
                                        ? background
                                        : selected == 'accent'
                                        ? accent
                                        : selected == 'text'
                                        ? text
                                        : selected == 'altText'
                                        ? altText
                                        : '#000000'
                                }
                                onChange={
                                    selected == 'background'
                                        ? setBackground
                                        : selected == 'accent'
                                        ? setAccent
                                        : selected == 'text'
                                        ? setText
                                        : selected == 'altText'
                                        ? setAltText
                                        : () => null
                                }
                            />
                        </div>

                        <div className="flex flex-col justify-center space-y-4 w-[50%] mr-auto ml-10 pt-1">
                            <Button
                                onClick={() => {
                                    setRandomColors()
                                }}
                                variant="outline"
                                className="no-drag"
                            >
                                Randomize
                            </Button>

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
                        <Label className="text-foreground" htmlFor="source">
                            Audio Source
                        </Label>
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
                                                        className={`${
                                                            v == currSinkId
                                                                ? 'bg-red-400/50'
                                                                : 'bg-white/20'
                                                        } mt-1`}
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
                                    <ReloadIcon className="pb-[0.1rem] h-[20px]" />
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
