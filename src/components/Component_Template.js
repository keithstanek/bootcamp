import React, { Component } from 'react';
import { connect } from 'react-redux'
import Spinner from "./spinner";


class CHANGE_ME extends Component {
    componentDidMount() {
        this.loadBlockchainData(this.props.dispatch).then();
    }

    async loadBlockchainData(dispatch) {
    }

    render() {
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Trades
                </div>
                <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        // TODO: Fill me in
    }
}

export default connect(mapStateToProps)(CHANGE_ME);
