import Web3 from 'web3'
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    allBalancesLoaded,
    exchangeTokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    tokenBalanceLoaded, etherBalanceLoaded, balancesLoading, balancesLoaded
} from './actions'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import {ETHER_ADDRESS} from "../helpers";

export const loadWeb3 = async (dispatch) => {
    if(typeof window.ethereum!=='undefined'){
        const web3 = new Web3(window.ethereum)
        dispatch(web3Loaded(web3))
        return web3
    } else {
        console.log('Please install MetaMask')
        window.location.assign("https://metamask.io/")
    }
}

export const loadAccount = async (web3, dispatch) => {

    const accounts = await web3.eth.getAccounts()
    const account = await accounts[0]
    if(typeof account !== 'undefined'){
        dispatch(web3AccountLoaded(account))
        return account
    } else {
        console.log('Please login with MetaMask')
        return null
    }
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadAllOrders = async (exchange, dispatch) => {
    // get cancelled orders
    const cancelStream = await exchange.getPastEvents('Cancel', {fromBlock: 0, toBlock: 'latest'});
    const cancelledOrders = cancelStream.map((event) => event.returnValues);
    dispatch(cancelledOrdersLoaded(cancelledOrders));

    // get trades (filled orders)
    const tradeStream = await exchange.getPastEvents('Trade', {fromBlock: 0, toBlock: 'latest'});
    const filledOrders = tradeStream.map((event) => event.returnValues);
    dispatch(filledOrdersLoaded(filledOrders));

    // get orders
    const orderStream = await exchange.getPastEvents('Order', {fromBlock: 0, toBlock: 'latest'});
    const allOrders = orderStream.map((event) => event.returnValues);
    dispatch(allOrdersLoaded(allOrders));
}

export const subscribeToEvents = async (exchange, dispatch) => {
    exchange.events.Cancel({}, (error, event) => {
        dispatch(orderCancelled(event.returnValues));
    })

    exchange.events.Trade({}, (error, event) => {
        dispatch(orderFilled(event.returnValues));
    })

    exchange.events.Deposit({}, (error, event) => {

        dispatch(balancesLoaded());
    })

    exchange.events.Withdraw({}, (error, event) => {
        dispatch(balancesLoaded());
    })
}

export const cancelOrder = (dispatch, exchange, order, account) => {
    // cancel the order on the blockchain
    exchange.methods.cancelOrder(order.id).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(orderCancelling())
        }).on('error', (error) => {
            console.log("Error cancelling order", error);
            window.alert("Error cancelling the order: " + error);
    }   );
}

export const fillOrder = (dispatch, exchange, order, account) => {
    // cancel the order on the blockchain
    exchange.methods.fillOrder(order.id).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(orderFilling())
        }).on('error', (error) => {
            console.log("Error filling order", error);
            window.alert("Error filling the order: " + error);
    }   );
}

export const loadAllBalances = async (dispatch, web3, exchange, token, account ) => {
    // ether wallet balance
    const etherBalance = await web3.eth.getBalance(account);
    dispatch(etherBalanceLoaded(etherBalance));

    // token balance from token contract
    const tokenBalance = await token.methods.balanceOf(account).call();
    dispatch(tokenBalanceLoaded(tokenBalance));

    // ether balance from exchange contract
    const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
    dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance));

    // token balance from exchange contract
    const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call();
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance));

    // trigger that all balances have been loaded
    dispatch(allBalancesLoaded());
};

export const depositEther = (dispatch, exchange, web3, amount, account) => {
    exchange.methods.depositEther().send({
        from: account,
        value: web3.utils.toWei(amount, 'ether')
    }).on('transactionHash', (hash) => {
        dispatch(balancesLoading())
    }).on('error', (error) => {
            console.log("Error depositing ether", error);
            window.alert("Error depositing ether: " + error);
        }
    );
}

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
    exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether') + '').send({ from: account })
    .on('transactionHash', (hash) => {
        dispatch(balancesLoading())
    }).on('error', (error) => {
            console.log("Error withdrawing ether", error);
            window.alert("Error withdrawing ether: " + error);
        }
    );
}

export const depositToken = (dispatch, exchange, token, web3, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether');
    token.methods.approve(exchange.options.address, amount).send({from: account })
    .on('transactionHash', (hash) => {
        exchange.methods.depositToken(token.options.address, amount).send({from: account})
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading())
        }).on('error', (error) => {
                console.log("Error depositing ether", error);
                window.alert("Error depositing ether: " + error);
            }
        );
    }).on('error', (error) => {
            console.log("Error depositing stnk", error);
            window.alert("Error depositing stnk: " + error);
        }
    );
}

export const withdrawToken = (dispatch, exchange, token, web3, amount, account) => {
    exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether') + '').send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading())
        }).on('error', (error) => {
            console.log("Error withdrawing stnk", error);
            window.alert("Error withdrawing stnk: " + error);
        }
    );
}

