import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
} from 'ton-core'

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {
    }

    public static createFromConfig(config: any, code: Cell, workchain = 0) {
        const data = new Cell()
        const init = { code: code, data: data }
        const address = contractAddress(workchain, init)

        return new MainContract(address, init)
    }

    public async sendInternalMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        number?: number
    ) {
        const bodyBuilder = beginCell()

        if (number) {
            bodyBuilder.storeUint(number, 32)
        }

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: bodyBuilder.endCell()
        })
    }

    public async getTheLatestSender(provider: ContractProvider) {
        const { stack} = await provider.get('get_the_latest_sender', [])

        return stack.readAddress()
    }

    public async getSum(provider: ContractProvider) {
        const { stack} = await provider.get('get_sum', [])

        return stack.readNumber()
    }
}
