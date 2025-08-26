import { hex } from '../build/main.compiled.json'
import { Cell, contractAddress } from 'ton-core'
import { getHttpV4Endpoint } from '@orbs-network/ton-access'
import { TonClient4 } from 'ton'
import { ENV, resolveEnv } from "./helpers";

(async function onChainTestScript() {
    const env = resolveEnv()

    console.log(`Current environment: ${env}`)

    const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0]
    const dataCell = new Cell()

    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell,
    })

    const endpoint = await getHttpV4Endpoint({
        network: env === ENV.TEST ? 'testnet' : 'mainnet'
    })

    const client4 = new TonClient4({ endpoint })

    const latestBlock = await client4.getLastBlock()
    let status = await client4.getAccount(latestBlock.last.seqno, address)

    if (status.account.state.type !== 'active') {
        console.error('Contract is not active')

        return
    }

    const getTheLatestSenderResponse = await client4.runMethod(
        latestBlock.last.seqno,
        address,
        'get_the_latest_sender',
    )

    if (getTheLatestSenderResponse.exitCode !== 0) {
        console.error('Running getter method failed')

        return
    }

    if (getTheLatestSenderResponse.result[0].type !== 'slice') {
        console.error('Unknown result type')

        return
    }

    console.log({
        latestSenderAddress: getTheLatestSenderResponse
            .result[0]
            .cell
            .beginParse()
            .loadAddress()
            .toString({ testOnly: true, bounceable: false })
    })

    const getSumResponse = await client4.runMethod(
        latestBlock.last.seqno,
        address,
        'get_sum',
    )

    if (getSumResponse.exitCode !== 0) {
        console.error('Running getter method failed')

        return
    }

    if (getSumResponse.result[0].type !== 'int') {
        console.error('Unknown result type')

        return
    }

    console.log({
        sum: getSumResponse
            .result[0]
            .value
    })
})()
