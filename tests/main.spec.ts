import { Cell, toNano } from 'ton-core'
import { hex } from '../build/main.compiled.json'
import { Blockchain } from '@ton-community/sandbox'
import { MainContract } from '../wrappers/MainContract'
import '@ton-community/test-utils'

describe('main.fc contract tests', () => {
    it('out first test', async () => {
        const blockchain = await Blockchain.create()

        const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]

        const contract = blockchain.openContract(
            MainContract.createFromConfig({}, codeCell)
        )

        const senderWallet = await blockchain.treasury('sender')

        const result = await contract.sendInternalMessage(
            senderWallet.getSender(),
            toNano('0.05')
        )

        expect(result.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: true
        })

        const data = await contract.getData()

        expect(data.recent_sender.toString()).toBe(senderWallet.address.toString())
    })
})
