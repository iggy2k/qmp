export function componentToHex(c: number) {
    var hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

export function grayness(hex: string) {
    if (hex[0] == '#') {
        hex = hex.slice(1)
    }
    let r = parseInt(hex.slice(0, 2), 16)
    let g = parseInt(hex.slice(2, 4), 16)
    let b = parseInt(hex.slice(4, 6), 16)
    return Math.abs(r - g) + Math.abs(r - b) + Math.abs(b - g)
}

export function rgbToHex(r: number, g: number, b: number) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

// Author: https://css-tricks.com/snippets/javascript/lighten-darken-color/
export function LightenDarkenColor(col: string, amt: number) {
    var usePound = false

    if (col[0] == '#') {
        col = col.slice(1)
        usePound = true
    }

    var num = parseInt(col, 16)

    var r = (num >> 16) + amt

    if (r > 255) r = 255
    else if (r < 0) r = 0

    var b = ((num >> 8) & 0x00ff) + amt

    if (b > 255) b = 255
    else if (b < 0) b = 0

    var g = (num & 0x0000ff) + amt

    if (g > 255) g = 255
    else if (g < 0) g = 0

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}

export function secondsToDhms(seconds: number) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor((seconds % (3600 * 24)) / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor(seconds % 60)

    var dDisplay = d + 'd '
    var hDisplay = h + 'h '
    var mDisplay = m + 'm '
    var sDisplay = s + 's '
    return dDisplay + hDisplay + mDisplay + sDisplay
}

export function secondsToDhmsShort(seconds: number) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor((seconds % (3600 * 24)) / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor(seconds % 60)

    var dDisplay = d > 0 ? (d < 10 ? '0' + d : d) + ' : ' : ''
    var hDisplay = h > 0 ? (h < 10 ? '0' + h : h) + ' : ' : ''
    var mDisplay = m > 0 ? (m < 10 ? '0' + m : m) + ' : ' : '00 : '
    var sDisplay = s > 0 ? (s < 10 ? '0' + s : s) + '' : '00'
    return dDisplay + hDisplay + mDisplay + sDisplay
}

export function invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1)
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    if (hex.length !== 6) {
        console.log('Invalid HEX color.')
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b)
}

function padZero(str: string, len: number = 2) {
    var zeros = new Array(len).join('0')
    return (zeros + str).slice(-len)
}

export function randomHexColor() {
    return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
}
