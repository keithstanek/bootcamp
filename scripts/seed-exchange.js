/**
 * Exec Script to Put test data on the blockchain.
 * ***NOTE: We only want to run this when working locally
 *
 * To execute this script, from the main project directory, execute:
 * truffle exec scripts/seed-exchange.js
 */


const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}

const tokens = (n) => ether(n); // same as ether

const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = async function(callback) {
    try {
         const accounts = await web3.eth.getAccounts();

         const token = await Token.deployed();
         console.log("Token Fetched", token.address);
         const exchange = await Exchange.deployed();
        console.log("Exchange Fetched", exchange.address);

        const sender = accounts[0]; // deployer
        const receiver = accounts[1];
        let amount = web3.utils.toWei('10000', 'ether'); // give 10k tokens

        await token.transfer(receiver, amount, {from: sender});
        console.log("Transferred " + amount + " tokens from " + sender + " to " + receiver);

        const user1 = accounts[0];
        const user2 = accounts[1];

        amount = 1; // ether
        await exchange.depositEther({from: user1, value: ether(amount)});
        console.log("Deposited " + amount + " ether for user 2");

        amount = 10000; // tokens
        await token.approve(exchange.address, tokens(amount), {from: user2});
        console.log("Approved " + amount + " tokes from " + user2);

        await exchange.depositToken(token.address, tokens(amount), {from: user2});
        console.log("Deposited " + amount + " tokens from " + user2);

        // ********************************************************
        // Send Cancelled Order
        let result, orderId;
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1});
        console.log("Made order from: " + user1);

        // Cancel the order
        orderId = result.logs[0].args.id;
        await exchange.cancelOrder(orderId, {from: user1});
        console.log("Cancelled Order [" + orderId + "] for user [" + user1 + "]");

        // ********************************************************
        // Fill Orders
        // Create order with user 1
        // Fulfill order with user 2
        // pause for a second

        // user 1 makes order
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1});
        console.log("Order made for user1: " + user1 + " Order ID: " + result.logs[0].args.id);

        // User2 fulfills the order
        orderId = result.logs[0].args.id;
        await exchange.fillOrder(orderId, {from: user2});
        console.log("Filled order id: " + orderId);

        await wait(1);

        // user 1 makes order
        result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.1), {from: user1});
        console.log("Order made for user1: " + user1);

        // User2 fulfills the order
        orderId = result.logs[0].args.id;
        await exchange.fillOrder(orderId, {from: user2});
        console.log("Filled order id: " + orderId);

        await wait(1);

        // user 1 makes order
        result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.1), {from: user1});
        console.log("Order made for user1: " + user1);

        // User2 fulfills the order
        orderId = result.logs[0].args.id;
        await exchange.fillOrder(orderId, {from: user2});
        console.log("Filled order id: " + orderId);

        await wait(1);

        //**************************************************
        // Seed open orders
        for (let i = 0; i <= 10; i++) {
            result = await exchange.makeOrder(token.address, tokens(10*i), ETHER_ADDRESS, ether(0.1), {from: user1});
            console.log("  Made order for user2: " + (10 * i));
            await wait(1);
        }

        for (let i = 0; i <= 10; i++) {
            result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.1), token.address, tokens(10*i), {from: user2});
            console.log("  Made order for user2: " + (10 * i));
            await wait(1);
        }

    } catch (err) {
        console.log("ERROR:");
        console.log(err);
    }

    callback();
}