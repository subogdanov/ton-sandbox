import { Cell, toNano} from 'ton-core'
import { hex } from '../build/main.compiled.json'
import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox'
import { MainContract } from '../wrappers/MainContract'
import '@ton-community/test-utils'

describe('main.fc contract tests', () => {
    let blockchain: Blockchain;
    let contract: SandboxContract<MainContract>;
    let initWallet: SandboxContract<TreasuryContract>;
    let ownerWallet: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        initWallet = await blockchain.treasury('initWallet');
        ownerWallet = await blockchain.treasury('ownerWallet');

        const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

        contract = blockchain.openContract(
            MainContract.createFromConfig(
                {
                    number: 0,
                    address: initWallet.address,
                    ownerAddress: ownerWallet.address,
                },
                codeCell
            )
        );
    })

    it('should successfully increase counter in contract and get the proper most recent sender address', async () => {
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

    it('successfully deposits funds', async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await contract.sendDeposit(
            senderWallet.getSender(),
            toNano('5')
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: true,
        });

        const balanceRequest = await contract.getBalance();

        expect(balanceRequest).toBeGreaterThan(toNano('4.99'));
    })

    it('should return deposit funds as no command is sent', async () => {
        const senderWallet = await blockchain.treasury('sender');

        const depositMessageResult = await contract.sendNoCodeDeposit(
            senderWallet.getSender(),
            toNano('5')
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: false,
        });

        const balanceRequest = await contract.getBalance();

        expect(balanceRequest).toBe(0);
    })

    it('successfully withdraws funds on behalf of owner', async () => {
        const senderWallet = await blockchain.treasury('sender');

        await contract.sendDeposit(senderWallet.getSender(), toNano('5'));

        const withdrawalRequestResult = await contract.sendWithdrawalRequest(
            ownerWallet.getSender(),
            toNano('0.05'),
            toNano('1')
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: contract.address,
            to: ownerWallet.address,
            success: true,
            value: toNano(1),
        });
    })

    it('fails to withdraw funds on behalf of non-owner', async () => {
        const senderWallet = await blockchain.treasury('sender');

        await contract.sendDeposit(senderWallet.getSender(), toNano('5'));

        const withdrawalRequestResult = await contract.sendWithdrawalRequest(
            senderWallet.getSender(),
            toNano('0.5'),
            toNano('1')
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: contract.address,
            success: false,
            exitCode: 103,
        });
    })

    it('fails to withdraw funds because lack of balance', async () => {
        const withdrawalRequestResult = await contract.sendWithdrawalRequest(
            ownerWallet.getSender(),
            toNano('0.5'),
            toNano('1')
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: ownerWallet.address,
            to: contract.address,
            success: false,
            exitCode: 104,
        });
    });
})
