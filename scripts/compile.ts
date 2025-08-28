import { Cell } from '@ton/core'
import { compileFunc } from '@ton-community/func-js'
import * as fs from 'node:fs'

(async function compileScript() {
    console.log('Compiling...')

    const compileResult = await compileFunc({
        targets: ['./contracts/main.fc'],
        sources: (x) => fs.readFileSync(x).toString('utf-8')
    })

    if (compileResult.status === 'error') {
        console.error(compileResult.message)

        process.exit(1)
    }

    console.log('Compiled successfully')

    const hexArtifact = './build/main.compiled.json'

    fs.writeFileSync(
        hexArtifact,
        JSON.stringify({
            hex: Cell.fromBoc(Buffer.from(compileResult.codeBoc, 'base64'))[0]
                .toBoc()
                .toString('hex')
        })
    )

    console.log(`Saved to ${hexArtifact}`)
})()
