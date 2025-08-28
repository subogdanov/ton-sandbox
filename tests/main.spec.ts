import {beginCell, Cell, toNano} from 'ton-core'
import { hex } from '../build/main.compiled.json'
import { Blockchain } from '@ton-community/sandbox'
import { MainContract } from '../wrappers/MainContract'
import '@ton-community/test-utils'

describe('main.fc contract tests', () => {
    it('should successfully increase counter in contract and get the proper most recent sender address', async () => {
        const blockchain = await Blockchain.create()

        const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]

        const initAddress = await blockchain.treasury('initAddress');

        const contract = blockchain.openContract(
            MainContract.createFromConfig(
                {
                    number: 0,
                    address: initAddress.address,
                },
                codeCell
            )
        )

        const senderWallet = await blockchain.treasury('sender')

        const result = await contract.sendIncrement(
            senderWallet.getSender(),
            toNano('0.05'),
            5
        )

        expect(result.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: true
        })

        const data = await contract.getData()

        expect(data.recentSender.toString()).toBe(senderWallet.address.toString());
        expect(data.number).toEqual(5);
    })
})
