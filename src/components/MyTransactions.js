import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Tabs} from "react-bootstrap";
import {Tab} from "bootstrap";
import Spinner from "./spinner";
import {
    myFilledOrdersLoadedSelector,
    myFilledOrdersSelector,
    myOpenOrderSelector,
    myOpenOrdersLoadedSelector
} from "../store/selectors";

const showMyFilledOrders = (myFilledOrders) => {
    return (
        <tbody>
        { myFilledOrders.map( (order) => {
            return (
                <tr key={order.id}>
                    <td className="text-muted">{order.formattedTimestamp}</td>
                    <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
                    <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                </tr>
            )
        }) }
        </tbody>
    );
}

const showMyOpenOrders = (myOpenOrders) => {
    return (
        <tbody>
        { myOpenOrders.map( (order) => {
            return (
                <tr key={order.id}>
                    <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
                    <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                    <td className="text-muted">x</td>
                </tr>
            )
        }) }
        </tbody>
    );
}

class MyTransaction extends Component {
    render() {
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">
                    My Transaction
                </div>
                <div className="card-body">
                    <Tabs defaultActiveKey="trades" className="bg-dark text-white">
                        <Tab eventKey="trades" title="Trades" className="bg-dark">
                            <table className="table table-dark table-sm small">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>STNK</th>
                                        <th>STNK/ETH</th>
                                    </tr>
                                </thead>
                                { this.props.showMyFilledOrders ? showMyFilledOrders(this.props.myFilledOrders) : <Spinner type="table" /> }
                            </table>
                        </Tab>
                        <Tab eventKey="orders" title="Orders" className="bg-dark">
                            <table className="table table-dark table-sm small">
                                <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>STNK</th>
                                    <th>STNK/ETH</th>
                                </tr>
                                </thead>
                                { this.props.showMyOpenOrders ? showMyOpenOrders(this.props.myOpenOrders) : <Spinner type="table" /> }
                            </table>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        myFilledOrders: myFilledOrdersSelector(state),
        showMyFilledOrders: myFilledOrdersLoadedSelector(state),
        myOpenOrders: myOpenOrderSelector(state),
        showMyOpenOrders: myOpenOrdersLoadedSelector(state)
    }
}

export default connect(mapStateToProps)(MyTransaction);
