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

    const randomNumber = Math.floor(Math.random() * 9) + 1; // 1 - 9

    console.log({ randomNumber })

    let link = 'ton://transfer/' +
        address.toString({
            testOnly: true
        }) + '?' + qs.stringify({
            amount: toNano('0.01').toString(10),
            init: stateInitCell.toBoc({ idx: false }).toString('base64'),
            bin: beginCell().storeUint(randomNumber, 32).endCell().toBoc().toString('base64')
        })

    qrcode.generate(link, { small: true }, (code) => {
        console.log('Link:', link)

        console.log(code)
    })
})()
