import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux'
import {accountSelector, exchangeSelector} from "../store/selectors";
import {loadAllOrders, subscribeToEvents} from "../store/interactions";
import Trades from "./Trades";
import OrderBook from "./OrderBook";
import MyTransactions from "./MyTransactions";
import PriceChart from "./PriceChart";
import Balance from "./Balance";
import NewOrder from "./NewOrder";


class Content extends Component {

    componentDidMount() {
        this.loadBlockchainData(this.props).then();
    }

    async loadBlockchainData(props) {
        const {exchange, dispatch} = props;
        await loadAllOrders(exchange, dispatch);
        await subscribeToEvents(exchange, dispatch);
    }

    render() {
        return (
            <div className="content">
                <div className="vertical-split">
                    <Balance />
                    <NewOrder />
                </div>
                <OrderBook />
                <div className="vertical-split">
                    <PriceChart />
                    <MyTransactions />
                </div>
                <Trades />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        account: accountSelector(state),
        exchange: exchangeSelector(state)
    }
}


export default connect(mapStateToProps)(Content);
