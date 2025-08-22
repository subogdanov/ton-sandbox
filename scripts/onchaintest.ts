import { hex } from '../build/main.compiled.json'
import { Address, Cell, contractAddress } from 'ton-core'
import { getHttpV4Endpoint } from '@orbs-network/ton-access'
import { TonClient4 } from 'ton'

(async function onChainTestScript() {
    const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]
    const dataCell = new Cell()

    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell,
    })

    const endpoint = await getHttpV4Endpoint({
        network: 'testnet'
    })

    const client4 = new TonClient4({ endpoint })

    const latestBlock = await client4.getLastBlock()
    let status = await client4.getAccount(latestBlock.last.seqno, address)

    if (status.account.state.type !== 'active') {
        console.error('Contract is not active')

        return
    }

    let latestSenderAddress: Address

    const response = await client4.runMethod(
        latestBlock.last.seqno,
        address,
        'get_the_latest_sender',
    )

    if (response.exitCode !== 0) {
        console.error('Running getter method failed')

        return
    }

    if (response.result[0].type !== 'slice') {
        console.error('Unknown result type')

        return
    }

    latestSenderAddress = response.result[0].cell.beginParse().loadAddress()

    console.log({ latestSenderAddress: latestSenderAddress.toString({ testOnly: true, bounceable: false })})
})()
