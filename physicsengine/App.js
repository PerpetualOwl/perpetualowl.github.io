// Path: App.js
// write js for website that uses react and javascript to create a simple physics engine with blocks

// import react
import React from 'react';

// import components
import Block from './Block';

// import css
import './App.css';

// create app
class App extends React.Component {
    // create constructor
    constructor(props) {
        // call super
        super(props);

        // create state
        this.state = {
            // create blocks
            blocks: [
                {
                    // create block
                    id: 0,
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    color: 'red',
                    velocity: {
                        x: 0,
                        y: 0
                    }
                },
                {
                    // create block
                    id: 1,
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    color: 'blue',
                    velocity: {
                        x: 0,
                        y: 0
                    }
                }
            ]
        };
    }

    // create render
    render() {
        // create blocks
        const blocks = this.state.blocks.map(block => {
            // return block
            return <Block key={block.id} block={block} />;
        });

        // return app
        return (
            <div className="App">
                {blocks}
            </div>
        );
    }
}

// export app
export default App;