import React from 'react';
import PropTypes from 'prop-types';
import {Stack, StackItem, LineChart, Dropdown, DropdownItem, navigation, ChartGroup, Grid, GridItem} from 'nr1';
import { arrangeIntoTree } from '../helpers/treeStruct';
import { getAccounts } from '../helpers/utils';
import TreeMenu from 'react-simple-tree-menu';
import ModalMsg from './modalMsg';

export default class Metrics extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.state = {
            currentSelection: null, 
            displayDashboard: false,
            currentAccount: null,
            accounts: []
        }
        this.actionHandler = this.actionHandler.bind(this)
      }
    
    actionHandler(node) {
        const parent = node.parent.split('/').pop()
        let currentSelection = ""
        if(parent) {
            currentSelection = parent.concat('.',node.label)
        } else{
            currentSelection = node.label
        }

        if(!node.hasNodes) {
            const accounts = getAccounts(currentSelection, this.props.data)
            const defaultAccount = accounts[0]
            this.setState({displayDashboard:true, currentAccount:defaultAccount, accounts:accounts})
        } else {
            this.setState({displayDashboard:false})
        }
        this.setState({currentSelection})
    }
    
    onAccountChange(accountId) {
        this.setState({currentAccount:accountId})
    }

    renderDashboard(accountId, metric) {
        const since = ` SINCE ${this.props.duration/1000/60} MINUTES AGO `
        console.log(since)
        const listScopes = this.props.scopes.map(scope => `'${scope}'`).reduce((acc,current) => `${current},${acc}`)
        const countQuery = `FROM MetricRaw SELECT count(\`${metric}\`) where rfc190Scope in (${listScopes}) TIMESERIES ${since}`
        const sumQuery = `FROM MetricRaw SELECT sum(\`${metric}\`) where rfc190Scope in (${listScopes}) TIMESERIES ${since}`
        console.log(countQuery)
        return  <ChartGroup>
                    <Grid>
                        <GridItem columnSpan={12} style={{marginTop: "50px"}}>
                            <Dropdown title="Accounts:">
                                {this.state.accounts.map((account,i) => <DropdownItem key={i} onClick={() => this.onAccountChange(account)}>{account.toString()}</DropdownItem>)}
                            </Dropdown>
                        </GridItem>
                        <GridItem columnSpan={12}>
                            <LineChart
                                accountId={accountId}
                                query={countQuery}
                                style={{marginTop: "20px"}}
                                fullWidth
                                onClickLine={()=>this.openInsights(countQuery)}
                            />
                        </GridItem>
                        <GridItem columnSpan={12}>
                            <LineChart
                                accountId={accountId}
                                query={sumQuery}
                                style={{marginTop: "20px"}}
                                fullWidth
                                onClickLine={()=>this.openInsights(sumQuery)}
                            />
                        </GridItem>
                    </Grid>
                </ChartGroup>
    }

    openInsights(query) {
        console.log(query)
        const nerdletWithState = {
            id: 'wanda-data-exploration.data-explorer',
            urlState: {initialNrqlValue:query, initialAccountId: this.state.currentAccount, initialActiveInterface:"nrqlEditor"}
       }
       
       navigation.openStackedNerdlet(nerdletWithState)
    }

    render() {

        const { data } = this.props
        return  (
            <>
                <ModalMsg data={data}/>
                <Grid>
                    <GridItem columnSpan={6}>
                        <Stack
                        directionType={Stack.DIRECTION_TYPE.VERTICAL} 
                        horizontalType={Stack.HORIZONTAL_TYPE.FILL}
                        fullWidth
                        gapType={Stack.GAP_TYPE.NONE}>
                            <StackItem className="title">
                                <b>Metrics:</b>
                            </StackItem>
                            <StackItem>
                                <TreeMenu data={arrangeIntoTree(data)} onClickItem={this.actionHandler} hasSearch={false}/>
                            </StackItem>
                            {this.state.currentSelection && <StackItem className="tree-selection-helper">
                                {this.state.currentSelection}
                            </StackItem>}
                        </Stack>
                    </GridItem>
                    <GridItem columnSpan={6}>
                        {this.state.displayDashboard && this.renderDashboard(this.state.currentAccount, this.state.currentSelection)}
                    </GridItem>
                </Grid>
            </>
        )
    }    
}
