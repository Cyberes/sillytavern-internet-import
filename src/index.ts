import chalk from 'chalk'
import {Router} from 'express'
import htmlContent from './import.html'

const MODULE = '[Internet Import]'

async function exit() {
}

async function init(router: Router) {
    logConsole('Plugin loaded!')

    // Send the import UI to client.
    router && router.get('/import', async (req, res) => {
        logConsole(`Got import from ${req.socket.remoteAddress}: ${req.query.url}`)
        res.send(htmlContent)
    })

    // A simple CORS proxy to allow the UI to fetch the data.
    router && router.get('/fetch', async (req, res) => {
        const sourceURLArg = req.query.url
        let resBody: string

        logConsole(`Got fetch from ${req.socket.remoteAddress}`)

        if (!sourceURLArg) {
            resBody = 'Missing "url" query parameter'
            res.status(400).send(resBody)
            return
        } else {
            logConsole(`Downloading character from "${sourceURLArg}"`)

            // Get the source URL. We double-decode the parameter since developers might want to double-encode it in case
            // the URL contains special characters.
            const sourceURL = new URL(decodeURIComponent(decodeURIComponent(sourceURLArg.toString()))).href

            try {
                // Make the request to where the source URL points us to.
                const response = await fetch(sourceURL, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
                    }
                })

                // If the response failed.
                if (!response.ok) {
                    const body = await response.text()
                    resBody = `Failed to fetch the character from the source: ${response.status}\n${body}`
                    logConsole(resBody)
                    res.status(502).send(resBody)
                    return
                }

                const blob = await response.blob()

                // Validate the Content-Type header to ensure it's an image.
                const contentType = response.headers.get('Content-Type') || ''
                if (!contentType.startsWith('image/') || blob.type !== 'image/png') {
                    resBody = `The fetched resource is not an image. Content-Type: ${contentType}. Received data type: ${blob.type}.`
                    logConsole(resBody)
                    res.status(400).send(resBody)
                    return
                }

                res.set('Content-Type', blob.type)
                res.set('Access-Control-Allow-Origin', '*')
                res.set('Access-Control-Allow-Methods', 'GET')

                // Send the image data as the response
                res.send(Buffer.from(await blob.arrayBuffer()))
            } catch (error) {
                // @ts-ignore
                logConsole(`An error occurred while fetching the character: ${error.message}`)
                // @ts-ignore
                res.status(500).send(error.message)
            }
        }
    })
}


function logConsole(message: string) {
    console.log(chalk.cyan.bold(MODULE), message)
}

export default {
    init,
    exit,
    info: {
        id: 'internet-import',
        name: 'Internet Import Callback',
        description: 'Allow websites to send character cards to your SillyTavern server.',
    },
}
