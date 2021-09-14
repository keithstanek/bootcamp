import React, { Component } from 'react';
import './App.css';
import Navbar from "./Navbar";

import { connect } from 'react-redux'
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'
import { accountSelector } from "../store/selectors";
import Content from "./Content";
import { contractsLoadedSelector } from "../store/selectors";


class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch).then();
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    let networkId = await web3.eth.net.getId()
    await window.ethereum.enable(); // if on a different network... I had to add this to log in to the local account
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    if (!token) {
      window.alert("Token smart contract not detected on the current network. Please select another network with Metamask");
      return;
    }
    const exchange = await loadExchange(web3, networkId, dispatch);
    if (!exchange) {
      window.alert("Exchange smart contract not detected on the current network. Please select another network with Metamask");
      return;
    }
  }

  render() {
    console.log("------------> account from state", this.props.account);
    return (
        <div>
          <Navbar />
          { this.props.contractsLoaded ? <Content /> : <div className="content"></div> }
        </div>
    );
  }
}

function mapStateToProps(state) {
  console.log("contracts loaded: " + contractsLoadedSelector(state));
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);
