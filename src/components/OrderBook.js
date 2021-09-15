import React, { Component } from 'react';
import { connect } from 'react-redux'
import Spinner from "./spinner";
import {
    accountSelector,
    exchangeSelector,
    orderBookLoadedSelector,
    orderBookSelector,
    orderFillingSelector
} from "../store/selectors";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {fillOrder} from "../store/interactions";

const renderOrder = (order, props) => {
    const { dispatch, exchange, account } = props;
    return (
        <OverlayTrigger key={order.id} placement="auto" overlay={
            <Tooltip id={order.id}>
                {`Click here to ${order.orderFillAction}`}
            </Tooltip>
        }>
            <tr className={`order-book-order`} key={order.id} onClick={ () => {
                fillOrder(dispatch, exchange, order, account);
            }}>
                <td>{order.tokenAmount}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                <td>{order.etherAmount}</td>
            </tr>
        </OverlayTrigger>
    );
}

const showOrderBook = (props) => {
    const { orderBook } = props;
    return (
        <tbody>
            {orderBook.sellOrders.map( (order) => renderOrder(order, props) )}

            {orderBook.buyOrders.map( (order) => renderOrder(order, props) )}
        </tbody>
    )
};

class OrderBook extends Component {
    render() {
        return (
            <div className="vertical">
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Order Book
                    </div>
                    <div className="card-body">
                        <table className="table table-dark table-sm small">
                            <thead>
                            <tr>
                                <th>Time</th>
                                <th>STNK</th>
                                <th>STNK/ETH</th>
                            </tr>
                            </thead>
                            { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' />  }
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const orderBookLoaded = orderBookLoadedSelector(state);
    const orderFilling = orderFillingSelector(state);
    return {
        orderBook: orderBookSelector(state),
        showOrderBook: orderBookLoaded && !orderFilling,
        exchange: exchangeSelector(state),
        account: accountSelector(state)
    }
}

export default connect(mapStateToProps)(OrderBook);
