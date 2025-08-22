import {beginCell, Cell, contractAddress, StateInit, storeStateInit, toNano} from 'ton-core';
import { hex } from '../build/main.compiled.json'
import qs from 'qs'
import qrcode from 'qrcode-terminal'

(async function deployScript() {
    const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]
    const dataCell = new Cell()

    const stateInit: StateInit = {
        code: codeCell,
        data: dataCell,
    }

    const stateInitBuilder = beginCell()
    storeStateInit(stateInit)(stateInitBuilder)
    const stateInitCell = stateInitBuilder.endCell()

    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell,
    })

    console.log(`The address of the contract is: ${address.toString()}`)
    console.log('Please scan the QR code below to deploy the contract:')

    let link = 'ton://transfer/' +
        address.toString({
            testOnly: true
        }) + '?' + qs.stringify({
            text: 'Deploy contract',
            amount: toNano('0.05').toString(10),
            init: stateInitCell.toBoc({ idx: false }).toString('base64'),
        })

    qrcode.generate(link, { small: true }, (code) => {
        console.log(code)
    })
})()
