import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './components/searchHeader';
import { getMetrics } from './helpers/nerdQueries';
import { Spinner } from 'nr1';

export default class MyNerdlet extends React.Component {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
    };

    constructor(props){
        super(props)
        this.state = { 
            data: null
        }
    }

    componentDidMount(){
        getMetrics().then(data => this.setState({data:data}))
    }

    render() {
        const { data } = this.state
        if (data) {
            return <SearchHeader data={data} onSearchClick={() => alert('Hello World!')} />
        } else {
            return <Spinner fillContainer />
        }
        
    }
}
