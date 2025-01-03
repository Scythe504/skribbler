import localFont from "next/font/local";
import { Poppins } from "next/font/google";

export const abaddon_bold = localFont({
    src: '../../public/fonts/Abaddon-Bold.woff2',
    variable: '--font-abaddon-bold',
    display: 'block',
})

export const poppins = Poppins({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    display: 'auto',
    subsets: ['latin'],
    style: ['italic', 'normal'],
    variable: '--font-poppins'
})

export const abaddon_light = localFont({
    src: '../../public/fonts/Abaddon-Light.woff2',
    variable: '--font-abaddon-light',
    display: 'block',
})
