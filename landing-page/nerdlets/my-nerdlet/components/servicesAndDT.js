import React from 'react';
import PropTypes from 'prop-types';
import 'react-table/react-table.css';
import {Stack, StackItem, EntitySearchQuery, Button, Grid, GridItem, navigation, Spinner, ChartGroup, AreaChart, LineChart, TableChart, PieChart} from 'nr1';
import { Accordion } from 'semantic-ui-react';

export default class ServicesAndDT extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.state = {
            scopesStatus: {}
        }
        this.getEntities = this.getEntities.bind(this)
      }

    renderList() {
        const { data } = this.props
        const rootPanels = data.map(scope => {
            return { key: scope, title: `Rfc190Scope: ${scope}`, content: { content: this.getEntitiesList(scope) } }
        })
        return <Accordion panels={rootPanels} onTitleClick={this.getEntities} styled />
    }

    getEntities(e, data) {
        const currentScope = this.props.data[data.index]
        this.setState(prevState => ({
            scopesStatus: {                   
                ...prevState.scopesStatus,    
                [currentScope]: data.active      
            }
        }))
    }

    setEntity(e, data) {}

    getEntitiesList(scope) {
        const FILTERS = [
            {
                type: 'entityType',
                value: {domain: 'APM', type: 'APPLICATION'}
            },
            {
                type: EntitySearchQuery.FILTER_TYPE.TAG,
                value: {key: 'rfc190Scope', value: scope}
            }
        ]
        return  (
                    <div>
                        {!this.state.scopesStatus[scope] && 
                        <EntitySearchQuery filters={FILTERS}>
                            {({loading, error, data}) => {
                                if (loading) {
                                    return <Spinner />
                                }
                                const listEntities = ((((data || {}).actor || {}).entitySearch || {}).results || {}).entities || []
                                if (!listEntities.length) {
                                    return <div>No services found for this scope</div>
                                }
                                return (
                                    <Accordion.Accordion panels={this.getEntitiesDetails(listEntities)}/>
                                )
                            }}
                        </EntitySearchQuery>}
                    </div>
                )
    }

    getEntitiesDetails(entities) {
        return entities.map((entity,i) => {
            const content = <div> Application Details: 
                                <Grid>
                                    <GridItem columnStart={9} columnEnd={10}>
                                        <Button
                                        onClick={() => this.onServiceClick(entity['guid'])}
                                        type={Button.TYPE.PLAIN}
                                        sizeType ={Button.SIZE_TYPE.SLIM}
                                        iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__MONITORING}>
                                        Open Service Overview
                                        </Button>
                                    </GridItem>
                                    <GridItem columnStart={11} columnEnd={12}>
                                        <Button
                                        onClick={() => this.onDTClick(entity['name'])}
                                        type={Button.TYPE.PLAIN}
                                        sizeType ={Button.SIZE_TYPE.SLIM}
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
         })
    }

    renderCharts(accountId, serviceName) {
        const responseTimeQ = `FROM Transaction SELECT average(duration) where appName = '${serviceName}' Timeseries`
        const throughtputHostQ = `FROM Transaction SELECT count(*) where appName = '${serviceName}' facet host TIMESERIES`
        const errorsCodeQ = `FROM TransactionError SELECT count(*) where appName = '${serviceName}' facet httpResponseCode Timeseries`
        const errorsMsgsQ = `SELECT count(*) FROM TransactionError where appName = '${serviceName}' facet error.message`
        const breakDownTranQ = `SELECT count(*), average(duration), average(databaseDuration), average(externalDuration) FROM Transaction where appName = '${serviceName}' FACET name`
        return (
        <ChartGroup>
            <Grid>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Response Time:
                    <LineChart
                        accountId={accountId}
                        query={responseTimeQ}
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Throughput:
                    <LineChart
                        accountId={accountId}
                        query={throughtputHostQ}
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Errors Http Response Codes:
                    <AreaChart
                        accountId={accountId}
                        query={errorsCodeQ}
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={6} style={{height: "200px", marginTop: "50px"}}>
                    Errors Count Per Message:
                    <PieChart
                        accountId={accountId}
                        query={errorsMsgsQ}
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
                <GridItem columnSpan={12} style={{height: "200px", marginTop: "50px"}}>
                    Transaction Perf Breakdown:
                    <TableChart
                        accountId={accountId}
                        query={breakDownTranQ}
                        style={{marginTop: "20px"}}
                    />
                </GridItem>
            </Grid>
        </ChartGroup>)
    }

    onServiceClick(guid) {
        // Opens stacked entity.
        const entity = {
            guid: guid,
            domain: 'APM',
            type: 'APPLICATION',
        }
        navigation.openStackedEntity(entity)

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

        return  <Stack
                    alignmentType={Stack.ALIGNMENT_TYPE.FILL}
                    directionType={Stack.DIRECTION_TYPE.VERTICAL} 
                    distributionType={Stack.DISTRIBUTION_TYPE.CENTER}
                    gapType={Stack.GAP_TYPE.NONE}
                    className="logs">
                    <StackItem className="title">
                        <b>Services and DT Overview:</b>
                    </StackItem>
                    <StackItem>
                        {this.renderList()}
                    </StackItem>
                </Stack>
    }    
}
