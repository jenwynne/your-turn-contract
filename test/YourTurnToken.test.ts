import { expect, use } from 'chai';
import { Contract } from 'ethers';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import YourTurnToken from '../build/contracts/YourTurnToken.json';

use(solidity);

describe('YourTurnToken', () => {
  const [wallet, walletTo] = new MockProvider().getWallets();
  let token: Contract;

  beforeEach(async () => {
    token = await deployContract(wallet, YourTurnToken, [1000]);
  });

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(1000);
  });

  it('Transfer adds amount to destination account', async () => {
    await token.transfer(walletTo.address, 7);
    expect(await token.balanceOf(walletTo.address)).to.equal(7);
  });

  it('Transfer emits event', async () => {
    await expect(token.transfer(walletTo.address, 7)).to.emit(token, 'Transfer').withArgs(wallet.address, walletTo.address, 7);
  });

  it('Can not transfer above the amount', async () => {
    await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
  });

  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo);
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1)).to.be.reverted;
  });

  it('Calls totalSupply on YourTurnToken contract', async () => {
    await token.totalSupply();
    expect('totalSupply').to.be.calledOnContract(token);
  });

  it('Calls balanceOf with sender address on YourTurnToken contract', async () => {
    await token.balanceOf(wallet.address);
    expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
  });

  it('Changes Ether Balance on multiple accounts', async () => {
    await expect(await wallet.sendTransaction({ to: walletTo.address, value: 200 })).to.changeEtherBalances(
      [wallet, walletTo],
      [-200, 200],
    );
  });
});
