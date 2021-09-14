import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux'
import { accountSelector } from "../store/selectors";


class Navbar extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/#">STaNK Token Exchange</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href={`https://etherscan.io/address/${this.props.account}`} target="_blank" rel="noopener noreferrer">{this.props.account}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

function mapStateToProps(state) {
    return {
        account: accountSelector(state)
    }
}


export default connect(mapStateToProps)(Navbar);
