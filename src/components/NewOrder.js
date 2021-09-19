import React, { Component } from 'react';
import { connect } from 'react-redux'
import Spinner from "./spinner";
import {Tabs} from "react-bootstrap";
import {Tab} from "bootstrap";
import {
    makeBuyOrder,
    makeSellOrder
} from "../store/interactions";
import {
    buyOrderAmountChanged, buyOrderPriceChanged,
    sellOrderAmountChanged, sellOrderPriceChanged
} from "../store/actions";
import {
    accountSelector,
    buyOrderSelector,
    exchangeSelector,
    sellOrderSelector,
    tokenSelector,
    web3Selector
} from "../store/selectors";

const showForm = (props) => {
    const { dispatch, exchange, token, web3, buyOrder, sellOrder, account, showBuyTotal, showSellTotal } = props;
    return (
        <Tabs defaultActiveKey="buy" className="bg-dark text-white">
            <Tab eventKey="buy" title="Buy" className="bg-dark">

                <form className="row" onSubmit={(event) => {
                    event.preventDefault();
                    makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account);
                }}>
                    <div className="mb-3">
                        <label className="form-label">Buy Amount (STNK)</label>
                        <input type="text" placeholder="Buy Amount" onChange={(e) => {
                            dispatch(buyOrderAmountChanged(e.target.value));
                        }}
                               className="form-control form-control-sm bg-dark text-white" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Buy Price</label>
                        <input type="text" placeholder="Buy Price" onChange={(e) => {
                            dispatch(buyOrderPriceChanged(e.target.value));
                        }}
                               className="form-control form-control-sm bg-dark text-white" />
                    </div>
                        <br />
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary btn-sm">Buy Order</button>
                    </div>
                    <div>
                        { showBuyTotal ? <small>Total: { buyOrder.amount * buyOrder.price } ETH</small> : null }
                    </div>
                </form>

            </Tab>
            <Tab eventKey="sell" title="Withdraw" className="bg-dark">
                <form className="row" onSubmit={(event) => {
                    event.preventDefault();
                    makeSellOrder(dispatch, exchange, token, web3, sellOrder, account);
                }}>
                    <div className="mb-3">
                        <label className="form-label">Sell Amount (STNK)</label>
                        <input type="text" placeholder="Sell Amount" onChange={(e) => {
                            dispatch(sellOrderAmountChanged(e.target.value));
                        }}
                               className="form-control form-control-sm bg-dark text-white" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Sell Price</label>
                        <input type="text" placeholder="Sell Price" onChange={(e) => {
                            dispatch(sellOrderPriceChanged(e.target.value));
                        }}
                               className="form-control form-control-sm bg-dark text-white" />
                    </div>
                    <br />
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary btn-sm">Sell Order</button>
                    </div>
                    <div>
                        { showSellTotal ? <small>Total: { sellOrder.amount * sellOrder.price } ETH</small> : null }
                    </div>
                </form>
            </Tab>
        </Tabs>
    )
}

class NewOrder extends Component {
    componentDidMount() {
        this.loadBlockchainData(this.props.dispatch).then();
    }

    async loadBlockchainData(dispatch) {
    }

    render() {
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">
                    New Order
                </div>
                <div className="card-body">
                    {this.props.showForm ? showForm(this.props) : <Spinner />}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const buyOrder = buyOrderSelector(state);
    const sellOrder = sellOrderSelector(state);
    return {
        exchange: exchangeSelector(state),
        account: accountSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        buyOrder,
        sellOrder,
        showForm: !buyOrder.making && !sellOrder.making,
        showBuyTotal: buyOrder.amount && buyOrder.price,
        showSellTotal: sellOrder.amount && sellOrder.price,
    }
}

export default connect(mapStateToProps)(NewOrder);
