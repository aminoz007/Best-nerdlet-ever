import React from 'react';
import PropTypes from 'prop-types';
import 'react-table/react-table.css';
import {Stack, StackItem, Button, Grid, GridItem, navigation, Spinner, ChartGroup, AreaChart, LineChart, TableChart, PieChart} from 'nr1';
import { Accordion } from 'semantic-ui-react';
import { getEntitiesByScope } from '../helpers/nerdQueries'

export default class ServicesAndDT extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.state = {
            currentDisplayedEntities: [],
            isLoading: true,
            selectedEntityIndex: -1,
        }
        this.onScopeClick = this.onScopeClick.bind(this)
        this.onEntityClick = this.onEntityClick.bind(this)
      }

    renderList() {
        const { data } = this.props
        const rootPanels = data.map(scope => {
            if (this.state.isLoading) {
                return { key: scope, title: `Rfc190Scope: ${scope}`, content: { content: <Spinner /> } }
            } else if (this.state.currentDisplayedEntities.length){
                return { key: scope, title: `Rfc190Scope: ${scope}`, content: { content: <Accordion.Accordion panels={this.getEntitiesDetails()} onTitleClick={this.onEntityClick}/> } }
            } else {
                return { key: scope, title: `Rfc190Scope: ${scope}`, content: "No services found for this scope"}
            } 
        })
        return <Accordion panels={rootPanels} onTitleClick={this.onScopeClick} styled />
    }

    onScopeClick(e, data) {
        this.setState({isLoading:true})
        const currentScope = this.props.data[data.index]
        if (!data.active) {
            getEntitiesByScope(currentScope).then(data => this.setState({currentDisplayedEntities:data, isLoading:false}))
        }
        console.log(currentScope)
    }

    onEntityClick(e, data) {
        if (!data.active) {
            this.setState({selectedEntityIndex:data.index})
        } else {
            this.setState({selectedEntityIndex:-1})
        }
    }

    getEntitiesDetails() {
        return this.state.currentDisplayedEntities.map((entity,i) => {
            if (this.state.selectedEntityIndex === i) {
                const content = <div> Application Details: 
                                    <Grid>
                                        <GridItem columnStart={9} columnEnd={10}>
                                            <Button
                                            onClick={() => navigation.openStackedEntity(entity['guid'])}
                                            type={Button.TYPE.PLAIN}
                                            sizeType ={Button.SIZE_TYPE.SMALL}
                                            iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__MONITORING}>
                                            Open Service Overview
                                            </Button>
                                        </GridItem>
                                        <GridItem columnStart={11} columnEnd={12}>
                                            <Button
                                            onClick={() => this.onDTClick(entity['name'])}
                                            type={Button.TYPE.PLAIN}
                                            sizeType ={Button.SIZE_TYPE.SMALL}
                                            iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__TRAFFIC}>
                                            Open Distributed Tracing
                                            </Button>
                                        </GridItem>
                                        <GridItem columnSpan={12}>
                                            {this.renderCharts(entity['accountId'],entity['name'])}
                                        </GridItem>
                                    </Grid>
                                </div>
                return {key: i, title: `Service name: ${entity['name']} / Account ID: ${entity['accountId']}`, content: {content: content} }
            } else {
                return {key: i, title: `Service name: ${entity['name']} / Account ID: ${entity['accountId']}`}
            }
        })

    }

    renderCharts(accountId, serviceName) {
        const since = ` SINCE ${this.props.duration/1000/60} MINUTES AGO `
        const responseTimeQ = `FROM Transaction SELECT average(duration) where appName = '${serviceName}' TIMESERIES ${since}`
        const throughtputHostQ = `FROM Transaction SELECT count(*) where appName = '${serviceName}' facet host TIMESERIES ${since}`
        const errorsCodeQ = `FROM TransactionError SELECT count(*) where appName = '${serviceName}' facet httpResponseCode TIMESERIES ${since}`
        const errorsMsgsQ = `SELECT count(*) FROM TransactionError where appName = '${serviceName}' facet error.message ${since}`
        const breakDownTranQ = `SELECT count(*), average(duration), average(databaseDuration), average(externalDuration) FROM Transaction where appName = '${serviceName}' FACET name ${since}`
        return (
        <ChartGroup>
            <Grid>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Response Time:
                    <LineChart
                        accountId={accountId}
                        query={responseTimeQ}
                        fullWidth
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Throughput:
                    <LineChart
                        accountId={accountId}
                        query={throughtputHostQ}
                        fullWidth
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Errors Http Response Codes:
                    <AreaChart
                        accountId={accountId}
                        query={errorsCodeQ}
                        fullWidth
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Errors Count Per Message:
                    <PieChart
                        accountId={accountId}
                        query={errorsMsgsQ}
                        fullWidth
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={12} style={{height: "200px", marginTop: "50px"}}>
                    Transaction Perf Breakdown:
                    <TableChart
                        accountId={accountId}
                        query={breakDownTranQ}
                        fullWidth
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
            </Grid>
        </ChartGroup>)
    }

    onDTClick(serviceName) {
        const state = {"query":{"operator":"AND","indexQuery":{"conditionType":"INDEX","operator":"AND","conditions":[]},"spanQuery":{"operator":"AND","conditionSets":[{"conditionType":"SPAN","operator":"AND","conditions":[{"attr":"appName","operator":"EQ","value":serviceName}]}]}}}     
        const nerdletWithState = {
            id: 'distributed-tracing-nerdlets.distributed-tracing-launcher',
            urlState: state
       }
       
       navigation.openStackedNerdlet(nerdletWithState)
    }
    
    render() {
        return  <Grid className="logs">
                    <GridItem columnSpan={12} className="title">
                        <b>Services and DT Overview:</b>
                    </GridItem>
                    <GridItem columnSpan={12} >
                        {this.renderList()}
                    </GridItem>
                </Grid>
    }    
}
