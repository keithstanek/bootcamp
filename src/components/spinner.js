import React from 'react';

export default function ({ type }) {
    if (type === 'table') {
        return ( <tbody className="spinner-border text-light text-center align-content-center align-middle"></tbody> );
    } else {
        return ( <div className="spinner-border text-light text-center"></div> );
    }
}