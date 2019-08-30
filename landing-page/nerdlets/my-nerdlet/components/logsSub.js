import React from 'react';
import PropTypes from 'prop-types';
import 'react-table/react-table.css';
import { getLogById } from '../helpers/nerdQueries';
import { Spinner, navigation, Button, Grid, GridItem } from 'nr1';

export default class LogsSub extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.state = {
          expandedRow: null,
          accountId: null,
        }
        this.getSingleDoc = this.getSingleDoc.bind(this)
        this.getMultiDoc = this.getMultiDoc.bind(this)
      }

    componentDidMount() {
      const { row } = this.props
      getLogById(row.original.guid, row.original.message_id).then(expandedRow => {
        this.setState({expandedRow:expandedRow.info, accountId:expandedRow.accountId})
      })
    }

    getSingleDoc() {
      const nerdletWithState = {
          id: 'logger.log-tailer',
          urlState: {"query":`messageId:"${this.state.expandedRow[0].messageId}"`, accountId:this.state.accountId}
        }
      return navigation.openStackedNerdlet(nerdletWithState)
    }

    getMultiDoc() {
      //const startTime = this.state.expandedRow[0].timestamp - (60 * 1000) // -1 minute
      //const endTime = this.state.expandedRow[0].timestamp + (60 * 1000)   // +1 minute
      //"timeRange":{"begin_time": startTime,"end_time":endTime,"duration":null}
      const nerdletWithState = {
          id: 'logger.log-tailer',
          urlState: {"query":`service_name:"${this.state.expandedRow[0].service_name  }"`, accountId:this.state.accountId}
      }
      return navigation.openStackedNerdlet(nerdletWithState)
    }

    getDetails() {
      return (
      <Grid>
        <GridItem columnStart= {9} columnEnd={10}>
          <Button
          onClick={this.getSingleDoc}
          type={Button.TYPE.PLAIN}
          sizeType ={Button.SIZE_TYPE.SLIM}>
          View single document
          </Button>
        </GridItem>
        <GridItem columnStart= {11} columnEnd={12}>
          <Button
          onClick={this.getMultiDoc}
          type={Button.TYPE.PLAIN}
          sizeType ={Button.SIZE_TYPE.SLIM}>
          View all service documents
          </Button>
        </GridItem>
        <GridItem columnSpan={9}>
          <pre style={{marginLeft: '30px'}}>
            {JSON.stringify(this.state.expandedRow[0], null, 4)}
          </pre>
        </GridItem>
      </Grid>)
    }

    render() {
      const location = "google.com"
      return (
        <div>
          {this.state.expandedRow ? 
           this.getDetails(): 
          <Spinner fillContainer type={Spinner.TYPE.INLINE} />}
        </div>
      )
    }    
}
