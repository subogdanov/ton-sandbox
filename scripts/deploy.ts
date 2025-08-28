import { address, toNano } from '@ton/core';
import { resolveEnv } from "./helpers";
import { MainContract } from "../wrappers/MainContract";
import { compile, NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    const env = resolveEnv()

    console.log(`Current environment: ${env}`)

    const walletAddress: string = '0QD4mlGU1Wlgn_vCb4tyAEPrI7BC8aRfMu0XHLUFdKKe7tYf'
    const codeCell = await compile('MainContract')

    const contract = MainContract.createFromConfig(
        {
            number: 0,
            address: address(walletAddress),
            ownerAddress: address(walletAddress),
        },
        codeCell
    );

    const openedContract = provider.open(contract);

    openedContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(contract.address);
}
