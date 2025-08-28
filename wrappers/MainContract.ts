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

export type MainContractConfig = {
    number: number;
    address: Address;
};

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {
    }

    public static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
        const data = beginCell()
            .storeUint(config.number, 32)
            .storeAddress(config.address)
            .endCell();
        const init = { code: code, data: data }
        const address = contractAddress(workchain, init)

        return new MainContract(address, init)
    }

    public async sendIncrement(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        incrementBy: number
    ) {
        const msgBody = beginCell()
            .storeUint(1, 32) // OP code
            .storeUint(incrementBy, 32) // increment_by value
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msgBody,
        });
    }

    public async getData(provider: ContractProvider) {
        const { stack} = await provider.get('get_contract_storage_data', [])

        return {
            number: stack.readNumber(),
            recentSender: stack.readAddress(),
        }
    }
}
