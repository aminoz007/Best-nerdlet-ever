import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './components/searchHeader';
import { getMetrics } from './helpers/nerdQueries';
import { Spinner } from 'nr1';
import { formatRfcAtt, filterAttrs } from './helpers/utils';

export default class MyNerdlet extends React.Component {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
    };

    constructor(props){
        super(props)
        this.onSelect = this.onSelect.bind(this)
        this.state = { 
            formattedData: null,
            rawData: null
        }
    }

    onSelect(selected) {
        const filteredData = filterAttrs(this.state.rawData, selected, this.state.formattedData)
        this.setState({formattedData:filteredData})
    }

    componentDidMount(){
        getMetrics().then(data => {
            const formattedData = formatRfcAtt(data)
            this.setState({formattedData:formattedData, rawData:data})
        })
    }

    render() {
        const { formattedData } = this.state
        if (formattedData) {
            return <SearchHeader data={formattedData} onSearchClick={() => alert('Hello World!')} onSelectRows={this.onSelect} />
        } else {
            return <Spinner fillContainer />
        }
        
    }
}
