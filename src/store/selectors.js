import {get, groupBy, reject} from 'lodash';
import { createSelector } from "reselect";
import {ETHER_ADDRESS, ether, tokens, GREEN, RED} from "../helpers";
import moment from "moment";

const account = state => get(state, 'web3.account');
export const accountSelector = createSelector(account, a => a);

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenSelector = createSelector(tokenLoaded, tl => tl);

const exchangeLoaded = state => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el);

const exchange = state => get(state, 'exchange.contract');
export const exchangeSelector = createSelector(exchange, e=> e);

export const contractsLoadedSelector = createSelector(
    tokenLoaded, exchangeLoaded, (tl, el) => (tl && el)
)

const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false);
const allOrders = state => get(state, 'exchange.allOrders.data', []);

const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false);
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, el => el);

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o);


const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false);
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, el => el);

const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
export const filledOrderSelector = createSelector(
    filledOrders, (orders) => {
        // sort ascending for price comparison
        orders = orders.sort( (a,b) => a.timestamp - b.timestamp);
        // sort by date descending
        orders = decorateFilledOrders(orders);
        orders = orders.sort( (a,b) => b.timestamp - a.timestamp);
        // console.log(orders);
        return orders;
    }
);

const decorateFilledOrders = (orders) => {
    let previousOrder = orders[0];
    return (
        orders.map( (order) => {
            order = decorateOrder(order);
            order = decorateFilledOrder(order, previousOrder);
            previousOrder = order;
            return order = order;
        })
    );
}

const decorateOrder = (order) => {
    // if token give == eth address
    let etherAmount, tokenAmount;
    if (order.tokenGive === ETHER_ADDRESS) {
        etherAmount = order.amountGive;
        tokenAmount = order.amountGet;
    } else {
        etherAmount = order.amountGet;
        tokenAmount = order.amountGive;
    }

    let tokenPrice = (etherAmount/tokenAmount);
    tokenPrice = Math.round(tokenPrice * 10000) / 10000;
    return ({
        ...order,
        etherAmount: ether(etherAmount),
        tokenAmount: tokens(tokenAmount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss A M/D')
    });
}

const decorateFilledOrder = (order, previousOrder) => {
    return ({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if (previousOrder.id === orderId) {
        return GREEN;
    }
    // show green if price is higher
    if (previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED;
    }
}

const openOrders = state => {
    const all = allOrders(state);
    const cancelled = cancelledOrders(state);
    const filled = filledOrders(state);

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some( (o) => o.id === order.id );
        const orderCancelled = cancelled.some( (o) => o.id === order.id);
        return (orderFilled || orderCancelled);
    })

    console.log("openOrders orders length: " + openOrders.length);

    return openOrders;
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state);
export const orderBookLoadedSelector = createSelector(orderBookLoaded, el => el);

export const orderBookSelector = createSelector(
    openOrders,
    (orders) => {
        orders = decorateOrderBookOrders(orders);
        // group by order type
        orders = groupBy(orders, 'orderType');

        // buy orders
        const buyOrders = get(orders, 'buy', []);
        orders = {
            ...orders,
            buyOrders: buyOrders.sort( (a,b) => b.tokenPrice = a.tokenPrice)
        }

        // sell orders
        const sellOrders = get(orders, 'sell', []);
        orders = {
            ...orders,
            sellOrders: sellOrders.sort( (a,b) => b.tokenPrice = a.tokenPrice)
        }
        return orders;
    }
);

const decorateOrderBookOrders = (orders) => {
    return (
        orders.map( (order) => {
            // decorate order book order
            order = decorateOrder(order);
            order = decorateOrderBookOrder(order);
            return (order);
        })
    )
};

const decorateOrderBookOrder = (order) => {
    const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell';
    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillClass: (orderType === 'buy' ? 'sell': 'buy')

    });
}
