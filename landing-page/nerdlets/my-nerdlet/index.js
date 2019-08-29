import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './components/searchHeader';
import Logs from'./components/logs';
import Metrics from'./components/metrics';
import ServicesAndDT from'./components/servicesAndDT';
import { getScopes, getData } from './helpers/nerdQueries';
import { Spinner, Toast } from 'nr1';
import { formatRfcAtt, filterAttrs, getScopesFromObject } from './helpers/utils';
import { DATA_TYPE } from './helpers/constants';

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
            logs: null,
            metrics: null
        }
    }

    onSelect(selectedData) {
        const { filteredDataFormatted, filteredRawData } = filterAttrs(this.state.rawData, selectedData, this.state.formattedData)
        this.setState({formattedData:filteredDataFormatted, selected:selectedData.selected, filteredRawData})
    }

    onSearchClick() {
        if (this.state.filteredRawData && getScopesFromObject(this.state.filteredRawData).length !== getScopesFromObject(this.state.rawData).length) {
            this.setState({displayDetails:true, logs:null, metrics: null})
            getData(this.state.filteredRawData, DATA_TYPE.LOGS).then(logs => this.setState({logs}))
            getData(this.state.filteredRawData, DATA_TYPE.METRICS).then(metrics => this.setState({metrics}))
        } else {
            Toast.showToast('Selection Needed', {
                description: 'Please select your scope!!',
                type: Toast.TYPE.CRITICAL
            })
        }
    }

    getDetails() {
        if(this.state.displayDetails) {
            if(this.state.logs && this.state.metrics) {
                return (
                <React.Fragment>
                    <Logs data={this.state.logs}/>
                    <Metrics data={this.state.metrics}/>
                    <ServicesAndDT data={getScopesFromObject(this.state.filteredRawData)}/>
                </React.Fragment>)
            } else {
                return <Spinner fillContainer type={Spinner.TYPE.INLINE} />
            }
        }
    }

    componentDidMount(){
        getScopes().then(data => {
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
