import React from 'react';
import PropTypes from 'prop-types';
import 'react-table/react-table.css';
import {Stack, StackItem, EntitySearchQuery, Button, Grid, GridItem, navigation, Spinner} from 'nr1';
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
        this.onServiceClick = this.onServiceClick.bind(this)
        this.onDTClick = this.onDTClick.bind(this)
        this.getEntities = this.getEntities.bind(this)
        this.getDetails = this.getDetails.bind(this)
      }

    renderList() {
        const { data } = this.props
        const list = []
        //const isLoading
        /*data.forEach(scope => {
            const FILTERS = [{
                    type: 'entityType',
                    value: {domain: 'APM', type: 'APPLICATION'}
                },
                {
                    type: EntitySearchQuery.FILTER_TYPE.TAG,
                    value: {key: 'rfc190Scope', value: scope}
                }
            ]
            const query = <EntitySearchQuery filters={FILTERS}>
                            {({loading, error, data}) => {
                                if (loading) {
                                    //isLoading[scope]=true
                                    return null
                                }

                                console.log(data)
                                console.log(FILTERS)
                                const listEntities = ((((data || {}).actor || {}).entitySearch || {}).results || {}).entities || []
                                //isLoading[scope]=false

                                return (
                                    <ul className="listHeader">
                                        <li>Rfc190Scope: {scope}</li>
                                        {this.renderPart(listEntities)}
                                    </ul>
                                )
                            }}
                        </EntitySearchQuery>
            list.push(query)
        });

        return list*/
        const rootPanels = data.map(scope => {
            return { key: scope, title: `Rfc190Scope: ${scope}`, content: { content: this.illiyji(scope) } }
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

    getDetails(e, data) {
        const currentScope = this.props.data[data.index]
        this.setState(prevState => ({
            scopesStatus: {                   
                ...prevState.scopesStatus,    
                [currentScope]: data.active      
            }
        }))
    }

    illiyji(scope) {
        const FILTERS = [{
            type: 'entityType',
            value: {domain: 'APM', type: 'APPLICATION'}
        },
        {
            type: EntitySearchQuery.FILTER_TYPE.TAG,
            value: {key: 'rfc190Scope', value: scope}
        }
    ]
    return  <div>{!this.state.scopesStatus[scope] && <EntitySearchQuery filters={FILTERS}>
                    {({loading, error, data}) => {
                        if (loading) {
                            return <Spinner />
                        }
                        const listEntities = ((((data || {}).actor || {}).entitySearch || {}).results || {}).entities || []
                        if (!listEntities.length) {
                            return <div>No services found for this scope</div>
                        }
                        return (
                            <Accordion.Accordion panels={this.niveau2(listEntities)}/>

                        )
                    }}
                </EntitySearchQuery>
            }</div>
    }
    niveau2(entities) {

        return entities.map((entity,i) => {
            const content = <div> Application Details: <Grid>
            <GridItem columnStart={9} columnEnd={10}>
                <Button
                onClick={this.onServiceClick}
                type={Button.TYPE.PLAIN}
                sizeType ={Button.SIZE_TYPE.SLIM}
                iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__MONITORING}>
                Open Service Overview
                </Button>
            </GridItem>
            <GridItem columnStart={11} columnEnd={12}>
                <Button
                onClick={this.onDTClick}
                type={Button.TYPE.PLAIN}
                sizeType ={Button.SIZE_TYPE.SLIM}
                iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__TRAFFIC}>
                Open Distributed Traces
                </Button>
            </GridItem>
        </Grid></div>
            return {key: i, title: `Service name: ${entity['name']} / Account ID: ${entity['accountId']}`, content: {content: content} }
         })
    }

    renderPart(entities) {
        if (!entities.length) {
            return <ul className="listContent"><li>No services found for this scope</li></ul>
        }
        return  <ul className="listContent">
                    { entities.map(entity => {
                                                return (
                                                    <div className="tab">
                                                        <li>
                                                            <Grid>
                                                                <GridItem columnSpan={3}>
                                                                    <span style={{color:"#0079bf"}}>Service name:</span> <i>{entity['name']}</i>
                                                                </GridItem>
                                                                <GridItem columnSpan={2}>
                                                                    <span style={{color:"#0079bf", marginLeft:"40px"}}>Account ID:</span> <i>{entity['accountId']}</i>
                                                                </GridItem>
                                                                <GridItem columnStart={9} columnEnd={10}>
                                                                    <Button
                                                                    onClick={this.onServiceClick}
                                                                    type={Button.TYPE.PLAIN}
                                                                    sizeType ={Button.SIZE_TYPE.SLIM}
                                                                    iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__MONITORING}>
                                                                    Open Service Overview
                                                                    </Button>
                                                                </GridItem>
                                                                <GridItem columnStart={11} columnEnd={12}>
                                                                    <Button
                                                                    onClick={this.onDTClick}
                                                                    type={Button.TYPE.PLAIN}
                                                                    sizeType ={Button.SIZE_TYPE.SLIM}
                                                                    iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__TRAFFIC}>
                                                                    Open Distributed Traces
                                                                    </Button>
                                                                </GridItem>
                                                            </Grid>
                                                        </li>
                                                    </div>
                                                )
                                            })
                    }
                </ul>
    }

    onServiceClick() {
        navigation.openStackedNerdlet({
            id: 'logger.log-tailer'
       })
    }
    onDTClick() {
        console.log("clicked")
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
