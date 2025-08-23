import {beginCell, Cell, toNano} from 'ton-core'
import { hex } from '../build/main.compiled.json'
import { Blockchain } from '@ton-community/sandbox'
import { MainContract } from '../wrappers/MainContract'
import '@ton-community/test-utils'

describe('main.fc contract tests', () => {
    it('check get_the_latest_sender method', async () => {
        const blockchain = await Blockchain.create()

        const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]

        const contract = blockchain.openContract(
            MainContract.createFromConfig({}, codeCell)
        )

        const senderWallet = await blockchain.treasury('sender')

        const result = await contract.sendInternalMessage(
            senderWallet.getSender(),
            toNano('0.05'),
        )

        expect(result.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: true
        })

        const theLatestSender = await contract.getTheLatestSender()

        expect(theLatestSender.toString()).toBe(senderWallet.address.toString())
    })

    it('check get_sum method', async () => {
        const blockchain = await Blockchain.create()

        const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]

        const contract = blockchain.openContract(
            MainContract.createFromConfig({}, codeCell)
        )

        const senderWallet = await blockchain.treasury('sender')

        const randomNumber = Math.floor(Math.random() * 9) + 1; // 1 - 9

        const result = await contract.sendInternalMessage(
            senderWallet.getSender(),
            toNano('0.05'),
            randomNumber
        )

        expect(result.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: true
        })

        const sum = await contract.getSum()

        expect(sum).toBe(randomNumber)
    })
})
