import React, { Component } from 'react';
import { connect } from 'react-redux'
import Spinner from "./spinner";
import {
    depositEther,
    depositToken,
    loadAllBalances,
    loadAllOrders,
    subscribeToEvents,
    withdrawEther, withdrawToken
} from "../store/interactions";
import {
    accountSelector, balancesLoadingSelector,
    etherBalanceSelector, etherDepositAmountSelector, etherWithdrawAmountSelector, exchangeEtherBalanceSelector,
    exchangeSelector, exchangeTokenBalanceSelector, tokenBalanceSelector, tokenDepositAmountSelector,
    tokenLoadedSelector,
    tokenSelector, tokenWithdrawAmountSelector,
    web3Selector
} from "../store/selectors";
import {Tab} from "bootstrap";
import {Tabs} from "react-bootstrap";
import {
    etherDepositAmountChanged,
    etherWithdrawAmountChanged,
    tokenDepositAmountChanged,
    tokenWithdrawAmountChanged
} from "../store/actions";

const showForm = (props) => {
    const { etherBalance, tokenBalance, exchangeEtherBalance, exchangeTokenBalance, dispatch, etherDepositAmount,
        etherWithdrawAmount, tokenDepositAmount, tokenWithdrawAmount, exchange, token, web3, account } = props;
    return (
        <Tabs defaultActiveKey="trades" className="bg-dark text-white">
            <Tab eventKey="trades" title="Deposit" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{ etherBalance }</td>
                            <td>{ exchangeEtherBalance }</td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                <form className="row" onSubmit={(event) => {
                                    event.preventDefault();
                                    depositEther(dispatch, exchange, web3, etherDepositAmount, account);
                                }}>
                                    <div className="col-12 col-sm pr-sm-2">
                                        <input type="text" placeholder="ETH Amount" onChange={(e) => {
                                            dispatch(etherDepositAmountChanged(e.target.value));
                                        }}
                                               className="form-control form-control-sm bg-dark text-white" required />
                                    </div>
                                    <div className="col-12 col-sm pr-sm-2">
                                        <button type="submit" className="btn btn-primary  btn-sm">Deposit</button>
                                    </div>
                                </form>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <th>STNK</th>
                            <th>{ tokenBalance }</th>
                            <th>{ exchangeTokenBalance }</th>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                <form className="row" onSubmit={(event) => {
                                    event.preventDefault();
                                    depositToken(dispatch, exchange, token, web3, tokenDepositAmount, account);
                                }}>
                                    <div className="col-12 col-sm pr-sm-2">
                                        <input type="text" placeholder="STNK Amount" onChange={(e) => {
                                            dispatch(tokenDepositAmountChanged(e.target.value));
                                        }}
                                               className="form-control form-control-sm bg-dark text-white" required />
                                    </div>
                                    <div className="col-12 col-sm pr-sm-2">
                                        <button type="submit" className="btn btn-primary  btn-sm">Deposit</button>
                                    </div>
                                </form>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Tab>
            <Tab eventKey="orders" title="Withdraw" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th>ETH</th>
                        <th>{ etherBalance }</th>
                        <th>{ exchangeEtherBalance }</th>
                    </tr>
                    <tr>
                        <td colSpan="3">
                            <form className="row" onSubmit={(event) => {
                                event.preventDefault();
                                withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account);
                            }}>
                                <div className="col-12 col-sm pr-sm-2">
                                    <input type="text" placeholder="ETH Amount" onChange={(e) => {
                                        dispatch(etherWithdrawAmountChanged(e.target.value));
                                    }}
                                           className="form-control form-control-sm bg-dark text-white" required />
                                </div>
                                <div className="col-12 col-sm pr-sm-2">
                                    <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                                </div>
                            </form>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3">&nbsp;</td>
                    </tr>
                    <tr>
                        <th>STNK</th>
                        <th>{ tokenBalance }</th>
                        <th>{ exchangeTokenBalance }</th>
                    </tr>
                    <tr>
                        <td colSpan="3">
                            <form className="row" onSubmit={(event) => {
                                event.preventDefault();
                                withdrawToken(dispatch, exchange, token, web3, tokenWithdrawAmount, account);
                            }}>
                                <div className="col-12 col-sm pr-sm-2">
                                    <input type="text" placeholder="STNK Amount" onChange={(e) => {
                                        dispatch(tokenWithdrawAmountChanged(e.target.value));
                                    }}
                                           className="form-control form-control-sm bg-dark text-white" required />
                                </div>
                                <div className="col-12 col-sm pr-sm-2">
                                    <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
                                </div>
                            </form>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </Tab>
        </Tabs>
    )
}
class Balance extends Component {
    componentDidMount() {
        this.loadBlockchainData().then();
    }

    async loadBlockchainData() {
        const { dispatch, web3, exchange, token, account } = this.props;
        await loadAllBalances(dispatch, web3, exchange, token, account );
    }

    render() {

        return (
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Balance
                </div>
                <div className="card-body">
                    {this.props.showForm ? showForm(this.props) : <Spinner />}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const balancesLoading = balancesLoadingSelector(state);
    return {
        exchange: exchangeSelector(state),
        account: accountSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
        balancesLoading,
        showForm: !balancesLoading,
        etherDepositAmount: etherDepositAmountSelector(state),
        etherWithdrawAmount: etherWithdrawAmountSelector(state),
        tokenDepositAmount: tokenDepositAmountSelector(state),
        tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
    }
}

export default connect(mapStateToProps)(Balance);
