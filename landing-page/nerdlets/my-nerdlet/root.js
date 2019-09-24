import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './components/searchHeader';
import Logs from './components/logs';
import Metrics from './components/metrics';
import ServicesAndDT from './components/servicesAndDT';
import { getScopes, getData } from './helpers/nerdQueries';
import { Spinner, Toast } from 'nr1';
import { formatRfcAtt, filterAttrs, getScopesFromObject } from './helpers/utils';
import { DATA_TYPE, MAX_SCOPES } from './helpers/constants';

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
            selection: null,
            displayDetails: false,
            logs: null,
            metrics: null,
            scopes: null,
        }
    }

    onSelect(selectedData) {
        const { filteredDataFormatted, filteredRawData } = filterAttrs(this.state.rawData, selectedData, this.state.formattedData)
        this.setState({formattedData:filteredDataFormatted, selection:selectedData, filteredRawData})
    }

    onSearchClick() {
        if (this.state.selection && Object.keys(this.state.selection.selected).filter(key => this.state.selection.selected[key].length).length) {  
            if(getScopesFromObject(this.state.filteredRawData).length > MAX_SCOPES) {
                Toast.showToast({
                    title: 'Maximum reached',
                    description: 'You cannot select more than 100 scope!!',
                    type: Toast.TYPE.CRITICAL
                })
            } else {
                const { duration } = this.props.launcherUrlState.timeRange
                this.setState({displayDetails:true, logs:null, metrics: null, scopes: null})
                getData(this.state.filteredRawData, DATA_TYPE.LOGS, duration).then(logs => this.setState({logs}))
                getData(this.state.filteredRawData, DATA_TYPE.METRICS, duration).then(metrics => this.setState({metrics}))
                this.setState({scopes: getScopesFromObject(this.state.filteredRawData)})
            }
        } else {
            Toast.showToast({
                title: 'Selection Needed',
                description: 'Please select your scope!!',
                type: Toast.TYPE.CRITICAL
            })
        }
    }

    getDetails() {
        if(this.state.displayDetails) {
            if(this.state.logs && this.state.metrics) {
                const { duration } = this.props.launcherUrlState.timeRange
                return (
                <React.Fragment>
                    <Logs data={this.state.logs}/>
                    <Metrics data={this.state.metrics} scopes={this.state.scopes} duration={duration}/>
                    <ServicesAndDT data={this.state.scopes} duration={duration}/>
                </React.Fragment>)
            } else {
                return <Spinner type={Spinner.TYPE.DOT} />
            }
        }
    }

    // Called only at the initial render
    componentDidMount(){
        const { duration } = this.props.launcherUrlState.timeRange
        getScopes(duration).then(data => {
            const formattedData = formatRfcAtt(data)
            this.setState({formattedData:formattedData, rawData:data})
        })
    }

    // Not called at the initial render but called later when the component has been updated
    // Should be wrapped in "if" or it will cause infinite loop
    componentDidUpdate(prevProps) {
        if (this.props.launcherUrlState.timeRange !== prevProps.launcherUrlState.timeRange) {
            const { duration } = this.props.launcherUrlState.timeRange  
            getScopes(duration).then(data => {
                const formattedData = formatRfcAtt(data)
                if (this.state.selection) {
                    const { filteredDataFormatted, filteredRawData } = filterAttrs(data, this.state.selection, formattedData)
                    this.setState({formattedData:filteredDataFormatted, filteredRawData})
                } else {
                    this.setState({formattedData:formattedData, rawData:data})
                }
                if (this.state.filteredRawData) { //TODO: check filteredRawData = rawdata
                    getData(this.state.filteredRawData, DATA_TYPE.LOGS, duration).then(logs => this.setState({logs}))
                    getData(this.state.filteredRawData, DATA_TYPE.METRICS, duration).then(metrics => this.setState({metrics}))
                }

            })
        }
      }

    render() {
        const { formattedData } = this.state
        if (formattedData) {
            return <React.Fragment>
                        <SearchHeader data={formattedData} onSearchClick={this.onSearchClick} onSelectRows={this.onSelect} />
                        {this.getDetails()}
                    </React.Fragment>
        } else {
            return <Spinner />
        }
    }
}
