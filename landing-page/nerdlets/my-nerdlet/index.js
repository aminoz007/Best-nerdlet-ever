import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './components/searchHeader';
import Logs from'./components/logs';
import { getMetrics, getLogs } from './helpers/nerdQueries';
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
        this.onSearchClick = this.onSearchClick.bind(this)
        this.state = { 
            formattedData: null,
            rawData: null,
            filteredRawData: null,
            selected: null,
            displayDetails: false,
            logs: null
        }
    }

    onSelect(selectedData) {
        const { filteredDataFormatted, filteredRawData } = filterAttrs(this.state.rawData, selectedData, this.state.formattedData)
        this.setState({formattedData:filteredDataFormatted, selected:selectedData.selected, filteredRawData})
    }

    onSearchClick() {
        this.setState({displayDetails:true})
        if (this.state.filteredRawData && this.state.filteredRawData.length !== this.state.rawData.length) {
            getLogs(this.state.filteredRawData).then(logs => this.setState({logs}))
        } else {
            this.setState({displayDetails:false})
            // TODO
            console.log("popup here: please select something")
        }
    }

    getDetails() {
        if(this.state.displayDetails) {
            if(this.state.logs) {
                return <Logs data={this.state.logs}/>
            } else {
                return <Spinner fillContainer type={Spinner.TYPE.INLINE} />
            }
        }
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
            return <React.Fragment>
                        <SearchHeader data={formattedData} onSearchClick={this.onSearchClick} onSelectRows={this.onSelect} />
                        {this.getDetails()}
                    </React.Fragment>
        } else {
            return <Spinner fillContainer />
        }
    }
}
