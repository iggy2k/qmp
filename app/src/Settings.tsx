import React, { useEffect, useState, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'
import { invertColor, randomHexColor } from './helpers'
import { IconAlertHexagon } from '@tabler/icons-react'

function Settings() {
    const [tab, setTab] = useState('appearance')

    const [mediaDevices, setMediaDevices] = useState<Object>({})
    const [refrashMediaDevices, setRefreshMediaDevices] = useState(false)

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
        <div className="bg-[#333333] h-[100vh] p-1 overflow-hidden drag">
            <div className="grid grid-cols-3 gap-3 mt-2 bg-black/10 rounded-md m-1 mb-3 h-[30px]">
                <div
                    className={`no-drag text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${
             tab == 'appearance'
                 ? 'transition duration-300 border-[#f08665] border-b-[1px]  '
                 : ' hover:bg-black/10 transition duration-300'
         }`}
                    onClick={() => {
                        setTab('appearance')
                    }}
                >
                    <p>Features</p>
                </div>
                <div
                    className={`no-drag text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${
             tab == 'colors'
                 ? 'transition duration-300 border-[#f08665] border-b-[1px] '
                 : ' hover:bg-black/10 transition duration-300'
         }`}
                    onClick={() => {
                        setTab('colors')
                    }}
                >
                    <p>Colors</p>
                </div>
                <div
                    className={`no-drag text-center text-[#bfbfbf] p-1 rounded-md text-sm h-[30px]
         ${
             tab == 'audio'
                 ? 'transition duration-300 border-[#f08665] border-b-[1px] '
                 : ' hover:bg-black/10 transition duration-300'
         }`}
                    onClick={() => {
                        setTab('audio')
                    }}
                >
                    <p>Audio</p>
                </div>
            </div>
            {tab == 'appearance' ? (
                <div className="grid grid-flow-col auto-cols-2 transition-opacity bg-black/10 m-1 pb-9 p-1">
                    <div className="no-drag  flex flex-col p-2">
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="use-cover"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200  ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                                onChange={() => {
                                    let oldSettings = { ...settings }
                                    oldSettings.useCover = !oldSettings.useCover
                                    setSettings(oldSettings)
                                }}
                                checked={settings.useCover}
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="use-cover"
                            >
                                Use cover for track colors
                            </label>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="move-colors"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200  ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                                onChange={() => {
                                    let oldSettings = { ...settings }
                                    oldSettings.movingColors =
                                        !oldSettings.movingColors
                                    setSettings(oldSettings)
                                }}
                                checked={settings.movingColors}
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="move-colors"
                            >
                                Moving track colors
                            </label>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="download-cover"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200  ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                                onChange={() => {
                                    let oldSettings = { ...settings }
                                    oldSettings.downloadCover =
                                        !oldSettings.downloadCover
                                    setSettings(oldSettings)
                                }}
                                checked={settings.downloadCover}
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="download-cover"
                            >
                                Click cover to download
                            </label>
                        </div>
                        <div className="w-max flex">
                            <input
                                type="checkbox"
                                id="transparent-inactive"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200  ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                                onChange={() => {
                                    let oldSettings = { ...settings }
                                    oldSettings.transparentInactive =
                                        !oldSettings.transparentInactive
                                    setSettings(oldSettings)
                                }}
                                checked={settings.transparentInactive}
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="transparent-inactive"
                            >
                                Transparency when inactive
                            </label>
                            <div title="Requires restarting the app.">
                                <IconAlertHexagon className="pb-[0.4rem] h-[24px] text-red-400" />
                            </div>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="bottom-bar"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200  ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                                onChange={() => {
                                    let oldSettings = { ...settings }
                                    oldSettings.bottomBar =
                                        !oldSettings.bottomBar
                                    setSettings(oldSettings)
                                }}
                                checked={settings.bottomBar}
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="bottom-bar"
                            >
                                Bottom information bar
                            </label>
                        </div>
                        <div className="w-max flex mb-2">
                            <input
                                type="checkbox"
                                id="frameless"
                                className="relative w-[1.77rem] h-4 bg-red-400  checked:bg-none checked:bg-green-600 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200  ring-1 ring-transparent focus:border-white/50 focus:ring-white/50 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-green-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-3 before:h-3 before:mb-[1rem] before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                                checked={settings.framelessWindow}
                                onChange={() => {
                                    let oldSettings = { ...settings }
                                    oldSettings.framelessWindow =
                                        !oldSettings.framelessWindow
                                    setSettings(oldSettings)
                                }}
                            />
                            <label
                                className="align-items-center pl-[0.4rem] hover:cursor-pointer text-white text-xs
                                "
                                htmlFor="frameless"
                            >
                                Frameless window
                            </label>
                            <div title="Requires restarting the app.">
                                <IconAlertHexagon className=" pb-[0.4rem] h-[24px] text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : tab == 'colors' ? (
                <div className="rounded-md m-1 p-2 grid grid-flow-row grid-cols-2 place-items-left bg-black/10">
                    <div className="no-drag mt-1 flex flex-row ml-5">
                        <div
                            className={
                                `w-[35px] h-[20px]` +
                                (selected == 'background' ? ` border-2` : '')
                            }
                            style={{
                                backgroundColor: `${background}`,
                                borderColor: `${invertColor(background)}`,
                            }}
                            onClick={() => setSelected('background')}
                        ></div>
                        <div>
                            <p className="ml-4 b-1 text-[#bfbfbf] font-semi text-sm">
                                Background
                            </p>
                        </div>
                    </div>
                    <div className="no-drag mt-1 grid grid-flow-col auto-cols-max ml-auto mr-5">
                        <div className="">
                            <p className="mr-4 b-1 text-[#bfbfbf] font-semi text-sm">
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
                            <p className="ml-4 b-1 text-[#bfbfbf] font-semi text-sm">
                                Text
                            </p>
                        </div>
                    </div>
                    <div className="no-drag mt-1 grid grid-flow-col auto-cols-max ml-auto mr-5">
                        <div className="grid grid-flow-col auto-cols-2">
                            <p className="mr-4 b-1 text-[#bfbfbf] font-semi text-sm">
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
                        <div
                            className="no-drag text-center text-[#bfbfbf] p-2 rounded-md	
border-[#f08665] border-b-[1px] hover:bg-black/10 transition-colors duration-300 h-[40px]"
                            onClick={() => {
                                setRandomColors()
                            }}
                        >
                            <p>Randomize</p>
                        </div>
                        <div
                            className="no-drag text-center text-[#bfbfbf] p-2 rounded-md	
border-[#f08665] border-b-[1px] hover:bg-black/10 transition-colors duration-300 h-[40px]"
                            onClick={() => {
                                setOldUIColors()
                                alert('Colors will remain after reload.')
                            }}
                        >
                            <p>Save</p>
                        </div>
                    </div>
                </div>
            ) : tab == 'audio' ? (
                <div className="text-white text-sm font-light">
                    <a
                        className="cursor-pointer hover:text-blue-400 transition-colors duration-300"
                        onClick={() => {
                            window.Main.send(
                                'open-url',
                                'https://github.com/iggy2k/qmp'
                            )
                        }}
                    >
                        https://github.com/iggy2k/qmp
                    </a>
                    <div
                        className="no-drag text-center text-[#bfbfbf] p-2 rounded-md	
border-[#f08665] border-b-[1px] hover:bg-black/10 transition-colors duration-300 h-[40px] w-[80px]"
                        onClick={() => {
                            setRefreshMediaDevices(!refrashMediaDevices)
                        }}
                    >
                        <p>Refresh</p>
                    </div>
                    {Object.entries(mediaDevices).map(([k, v]) => (
                        <div
                            className="bg-white/20 mt-1"
                            onClick={() => {
                                setAudioOutput(k)
                            }}
                        >
                            {k == 'default'
                                ? 'Same as system'
                                : v
                                      .replace('(Virtual)', '')
                                      .replace('(Built-in)', '')
                                      .replace('(Bluetooth)', '')}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export default Settings
