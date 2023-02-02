// Path: Block.js
// write js for website that uses react and javascript to create a simple physics engine with blocks
// add gravity to blocks as well that stops when touching the ground

// import react
import React from 'react';

// import css
import './Block.css';

// create block
class Block extends React.Component {
    // create constructor
    constructor(props) {
        // call super
        super(props);

        // create state
        this.state = {
            // create block
            block: this.props.block
        };
    }

    // create render
    render() {
        // create block
        const block = this.state.block;

        // create style
        const style = {
            // set position
            position: 'absolute',
            // set left
            left: block.x,
            // set top
            top: block.y,
            // set width
            width: block.width,
            // set height
            height: block.height,
            // set background color
            backgroundColor: block.color
        };

        // return block
        return <div className="block" style={style}></div>;
    }
}