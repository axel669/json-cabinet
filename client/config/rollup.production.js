import svelte from "rollup-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import {terser} from "rollup-plugin-terser"
import html from "@axel669/rollup-html"

import tea from "@axel669/teascript/rollup"
import svelteTea from "@axel669/teascript/svelte"

import copy from "./plugins/copy.js"
import simpleLocation from "./plugins/simple-location"

import appInfo from "./app-info.js"

export default {
    input: "./src/main.js",
    output: {
        file: `./build/app-${Date.now()}.js`,
        format: "iife",
    },
    plugins: [
        svelte({
            preprocess: svelteTea,
        }),
        tea,
        simpleLocation,
        resolve({
            extensions: [".js", ".svelte"]
        }),
        commonjs(),
        terser(),
        html({
            template: "config/base.html",
            output: "index.html",
            props: appInfo,
        }),
        copy("static", "build")
    ]
}
