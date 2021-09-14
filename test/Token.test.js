const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should();
import {EVM_REVERT, tokens} from "../helpers";

contract('Token', async ([deployer, receiver, exchange]) => {


    const name = 'Stanky Token';
    const symbol = 'STNK'
    const decimals = '18';
    const totalSupply = tokens(1000000).toString();
    let token;

    beforeEach(async () => {
        token = await Token.new();
    })

    describe('Deployment', () => {
        it('Compare Contract Name to \'My Name\'', async () => {
            const result = await token.name();
            result.should.equals(name);
        })

        it('Compare the Symbol', async () => {
            const result = await token.symbol();
            result.should.equals(symbol);
        })

        it('Compare the Decimal', async () => {
            const result = await token.decimals();
            result.toString().should.equals(decimals);
        })

        it('Compare the Total Supply', async () => {
            const result = await token.totalSupply();
            result.toString().should.equals(totalSupply.toString());
        })

        it('Check to make sure the owner owns all the tokens', async () => {
            const result = await token.balanceOf(deployer);
            result.toString().should.equals(totalSupply.toString());
        })
    });

    describe('Sending Tokens', () => {
        let amount;
        let result;

        describe('Successful Transfer', () => {
            beforeEach(async () => {
                amount = tokens(100);
                result = await token.transfer(receiver, amount, {from: deployer});
            });
            it('Transfers Token Balance Works', async () => {
                let balanceOf;
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString());
                balanceOf = await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString());
            })

            it('Emits Transfer Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Transfer');
                const events = log.args;
                events.from.toString().should.equals(deployer, 'From User is Correct');
                events.to.toString().should.equals(receiver, 'To User is Correct');
                events.value.toString().should.equals(amount.toString(), 'Amount is Correct');
            })
        });

        describe('Failure Transfer', () => {
            it('Reject Insufficient Funds', async () => {
                let invalidAmount;
                invalidAmount = tokens(1000000000000);
                await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT);

                invalidAmount = tokens(100);
                await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT);

            })

            it('Reject Invalid Recipient', async () => {
                await token.transfer(0x0, amount, {from: deployer}).should.be.rejected;
            })

        });
    });

    describe('Approving Tokens', () => {
        let amount;
        let result;

        beforeEach(async () => {
            amount = tokens(100);
            result = await token.approve(exchange, amount, {from: deployer});
        });

        describe('Successful Token Approval', () => {
            it('Allocates Allowance for Delegated Token Spending On Exchange', async () => {
                const allowance = await token.allowance(deployer, exchange);
                allowance.toString().should.equal(amount.toString());
            })

            it('Emits Approval Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Approval');
                const events = log.args;
                events.owner.toString().should.equals(deployer, 'Owner User is Correct');
                events.spender.toString().should.equals(exchange, 'Exchange User is Correct');
                events.value.toString().should.equals(amount.toString(), 'Amount is Correct');
            })
        });

        describe('Failure Token Approval', () => {
            it('Reject Invalid Spenders', async () => {
                await token.approve(0x0, amount, {from: deployer}).should.be.rejected;
            })
        });
    });

    describe('Delegated Token Transfers With Approval', () => {
        let amount;
        let result;

        beforeEach(async () => {
            amount = tokens(100);
            await token.approve(exchange, amount, {from: deployer});
        });

        describe('Successful Transfer', () => {
            beforeEach(async () => {
                result = await token.transferFrom(deployer, receiver, amount, { from: exchange });
            });
            it('Transfers Token Balance Works', async () => {
                let balanceOf;
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString());
                balanceOf = await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString());
            })

            it('Reset the Allowance', async () => {
                const allowance = await token.allowance(deployer, exchange);
                allowance.toString().should.equal('0');
            })

            it('Emits Transfer Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Transfer');
                const events = log.args;
                events.from.toString().should.equals(deployer, 'From User is Correct');
                events.to.toString().should.equals(receiver, 'To User is Correct');
                events.value.toString().should.equals(amount.toString(), 'Amount is Correct');
            })
        });

        describe('Failure Transfer', () => {
            it('Reject Insufficient Funds', async () => {
                let invalidAmount = tokens(1000000000000);
                await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_REVERT);

                // invalidAmount = tokens(100);
                // await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT);

            })

            it('Reject Invalid Recipient', async () => {
                await token.transfer(0x0, amount, {from: deployer}).should.be.rejected;
            })

        });
    });
})