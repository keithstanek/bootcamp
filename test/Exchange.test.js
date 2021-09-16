const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should();
import {ETHER_ADDRESS, EVM_REVERT, tokens, ether} from "./helpers";

contract('Exchange', async ([deployer, feeAccount, user1, user2]) => {

    const name = 'Stanky Token Exchange Contract';
    // const symbol = 'STNK'
    // const decimals = '18';
    // const totalSupply = tokens(1000000).toString();
    let exchange;
    let token;
    let feePercent = 10;

    beforeEach(async () => {
        token = await Token.new();                                 // deploy token contract
        token.transfer(user1, tokens(100), { from: deployer }); // transfer some tokens
        exchange = await Exchange.new(feeAccount, feePercent);     // deploy exchange contract

    })

    describe('Deployment', () => {
        it('Compare Contract Name to \'My Name\'', async () => {
            const result = await exchange.name();
            result.should.equals(name);
        })

        it('Compare Fee Account', async () => {
            const result = await exchange.feeAccount();
            result.should.equals(feeAccount);
        })

        it('Compare Fee Percent', async () => {
            const result = await exchange.feePercent();
            result.toString().should.equals(feePercent.toString());
        })
    });

    describe('Fallback - Refund Ether', () => {
        let result;
        let amount;

        // beforeEach(async () => {
        //     amount = ether(1);
        //     result = await exchange.depositEther({from: user1, value: amount});
        // })

        it('Revert If Ether Is Sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1}).should.be.rejected;
        })
    });

    describe('Depositing Ether', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            result = await exchange.depositEther({from: user1, value: amount});
        })

        it('Tracks the Ether Deposit', async () => {
            // check balance
            let balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.equal(amount.toString());
        })

        it('Emits Deposit Notification', async () => {
            const log = result.logs[0];
            log.event.should.eq('Deposit');
            const events = log.args;
            events.token.toString().should.equals(ETHER_ADDRESS, 'Token is Correct');
            events.user.toString().should.equals(user1, 'User is Correct');
            events.amount.toString().should.equals(amount.toString(), 'Amount is Correct');
            events.balance.toString().should.equals(amount.toString(), 'Balance is Correct');
        })
    });

    describe('Withdrawing Ether', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            // deposit the ether first
            result = await exchange.depositEther({from: user1, value: amount});
        })

        describe('Withdraw Success', () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, {from: user1});
            });

            it('Withdraw Ether Funds', async () => {
                // check balance
                let balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.equal("0");
            });
            it('Emits Withdraw Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const events = log.args;
                events.token.toString().should.equals(ETHER_ADDRESS, 'Token is Correct');
                events.user.toString().should.equals(user1, 'User is Correct');
                events.amount.toString().should.equals(amount.toString(), 'Amount is Correct');
                events.balance.toString().should.equals("0", 'Balance is Correct');
            });
        });

        describe('Withdraw Failure', () => {
            it('Rejects Withdraw for Insufficient Balance', async () => {
                await exchange.withdrawEther(ether(200), {from: user1}).should.be.rejected;
            })
        });
    });

    describe('Depositing Tokens', () => {
        let result;
        let amount;

        describe('Success', () => {
            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, {from: user1});
                result = await exchange.depositToken(token.address, amount, {from: user1});
            })

            it('Tracks the Token Deposit', async () => {
                // check balance
                let balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal(amount.toString());
                // check tokens on exchange
                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal(amount.toString());
            })

            it('Emits Deposit Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Deposit');
                const events = log.args;
                events.token.toString().should.equals(token.address, 'Token is Correct');
                events.user.toString().should.equals(user1, 'User is Correct');
                events.amount.toString().should.equals(tokens(10).toString(), 'Amount is Correct');
                events.balance.toString().should.equals(tokens(10).toString(), 'Balance is Correct');
            })
        });

        describe('Failure', () => {
            it('Fails When No Tokens Are Approved', async () => {
                await exchange.depositToken(token.address, tokens(10), {from: user1}).should.be.rejected;
            })

            it('Rejects Ether Deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejected;
            })
        });
    });

    describe('Withdrawing Stanky Token', () => {
        let result;
        let amount;

        describe('Successful Token Withdraw', () => {
            beforeEach(async () => {
                amount = tokens(10);
                // deposit the ether first
                await token.approve(exchange.address, amount, {from: user1});
                await exchange.depositToken(token.address, amount, {from: user1});

                // Withdraw the tokens
                result = await exchange.withdrawToken(token.address, amount, {from: user1});
            });

            it('Withdraw Token', async() => {
                const balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equals("0");
            });

            it('Emits Token Withdraw Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const events = log.args;
                events.token.toString().should.equals(token.address, 'Token is Correct');
                events.user.toString().should.equals(user1, 'User is Correct');
                events.amount.toString().should.equals(amount.toString(), 'Amount is Correct');
                events.balance.toString().should.equals("0", 'Balance is Correct');
            });

        });

        describe('Failure Token Withdraw', () => {
            // beforeEach(async () => {
            //     amount = tokens(10);
            //     // deposit the ether first
            //     await token.approve(exchange.address, amount, {from: user1});
            //     await exchange.depositToken(token.address, amount, {from: user1});
            //
            //     // Withdraw the tokens
            //     result = await exchange.withdrawToken(token.address, amount, {from: user1});
            // });
            it('Withdraw Ether', async() => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejected;
            });

            it('Withdraw more tokens then you own', async() => {
                await exchange.withdrawToken(token.address, tokens(10), {from: user1}).should.be.rejected;
            });
        });
    });

    describe('Check User Balances', () => {
        let amount;
        let result;
        beforeEach(async () => {
            amount = ether(1);
            await exchange.depositEther({from: user1, value: amount});
        });

        it('Returns User Ether Balance', async () => {
            let result = await exchange.balanceOf(ETHER_ADDRESS, user1);
            result.toString().should.equal(amount.toString());
        })
    });

    describe('Order Creation', () => {
        let tokenAmount, etherAmount, result;

        beforeEach(async () => {
            tokenAmount = tokens(1);
            etherAmount = ether(1);
            result = await exchange.makeOrder(token.address, tokenAmount, ETHER_ADDRESS, etherAmount, {from: user1});
        });

        it('Check Newly Created Order', async () => {
            const orderCount = await exchange.orderCount();
            orderCount.toString().should.equal("1");
            const order = await exchange.orders('1');
            order.id.toString().should.equal("1", "Order ID is correct");
            order.user.toString().should.equal(user1, 'User is correct');
            order.tokenGet.toString().should.equal(token.address, "Get token is correct");
            order.amountGet.toString().should.equal(tokenAmount.toString(), "Get token amount is correct");
            order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Give token is correct');
            order.amountGive.toString().should.equal(etherAmount.toString(), "Give token amount correct");
            order.timestamp.toString().length.should.at.least(1, "Timestamp value is valid");
        })

        it('Emits Order Notification', async () => {
            const log = result.logs[0];
            log.event.should.eq('Order');
            const event = log.args;
            event.id.toString().should.equal("1", "Order ID is correct");
            event.user.toString().should.equal(user1, 'User is correct');
            event.tokenGet.toString().should.equal(token.address, "Get token is correct");
            event.amountGet.toString().should.equal(tokenAmount.toString(), "Get token amount is correct");
            event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Give token is correct');
            event.amountGive.toString().should.equal(etherAmount.toString(), "Give token amount correct");
            event.timestamp.toString().length.should.at.least(1, "Timestamp value is valid");
        });
    });

    describe('Order Actions', () => {
        let result;

        beforeEach(async () => {

            // user 1 deposits ether
            await exchange.depositEther({from: user1, value: ether(1)});
            // give tokens to user 2
            await token.transfer(user2, tokens(100), {from: deployer});
            // user 2 deposit tokens only
            await token.approve(exchange.address, tokens(2), {from: user2});
            await exchange.depositToken(token.address, tokens(2), {from: user2});

            // user1 makes an order to buy tokens with ether
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1});
        });

        describe('Filling Orders', () => {
            let result;

            describe('Filling Orders Success', () => {
                beforeEach(async () => {
                    result = await exchange.fillOrder('1', {from: user2});
                });

                it('Execute the trade and charge fees', async () => {
                    let balance;
                    balance = await exchange.balanceOf(token.address, user1);
                    balance.toString().should.equal(tokens(1).toString(), "User1 received tokens");
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
                    balance.toString().should.equal(ether(1).toString(), "User2 received ether");
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
                    balance.toString().should.equal("0", "User2 ether deducted");
                    balance = await exchange.balanceOf(token.address, user2);
                    balance.toString().should.equal(tokens(0.9).toString(), "User2 tokens deducted with fee applied");
                    const feeAccount = await exchange.feeAccount();
                    balance = await exchange.balanceOf(token.address, feeAccount);
                    balance.toString().should.equal(tokens(0.1).toString(), "fee account received fee");
                })

                it('Updated Filled Orders', async () => {
                    const orderFilled = await exchange.orderFilled(1);
                    orderFilled.should.equal(true);
                })

                it('Emits Trade Notification', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Trade');
                    const event = log.args;
                    event.id.toString().should.equal("1", "Order ID is correct");
                    event.user.toString().should.equal(user1, 'User is correct');
                    event.tokenGet.toString().should.equal(token.address, "Get token is correct");
                    event.amountGet.toString().should.equal(tokens(1).toString(), "Get token amount is correct");
                    event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Give token is correct');
                    event.amountGive.toString().should.equal(ether(1).toString(), "Give token amount correct");
                    event.userFill.toString().should.equal(user2, "User2 intiated the even is correct");
                    event.timestamp.toString().length.should.at.least(1, "Timestamp value is valid");
                });
            });
        });

        describe('Cancel Orders', () => {
        let result;

        describe('Successful Order Cancel', () => {
            beforeEach(async () => {
                result = await exchange.cancelOrder('1', {from: user1});
            });

            it('Updates Cancelled Order', async () => {
                const orderCancelled = await exchange.orderCancelled('1');
                orderCancelled.should.equal(true);
            });

            it('Emits Cancel Notification', async () => {
                const log = result.logs[0];
                log.event.should.eq('Cancel');
                const event = log.args;
                event.id.toString().should.equal("1", "Order ID is correct");
                event.user.toString().should.equal(user1, 'User is correct');
                event.tokenGet.toString().should.equal(token.address, "Get token is correct");
                event.amountGet.toString().should.equal(tokens(1).toString(), "Get token amount is correct");
                event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'Give token is correct');
                event.amountGive.toString().should.equal(ether(1).toString(), "Give token amount correct");
                event.timestamp.toString().length.should.at.least(1, "Timestamp value is valid");
            });
        });

        describe('Failure Order Cancel', () => {
           it('Rejects Invalid Order ID', async () => {
               await exchange.cancelOrder(99999, {from: user1}).should.be.rejected;
           });
            it('Rejects Unauthorized Cancellization', async () => {
                await exchange.cancelOrder(1, {from: deployer}).should.be.rejected;
            });
        });
    });
    });
});
