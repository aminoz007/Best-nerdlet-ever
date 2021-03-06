import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import {Grid, GridItem} from 'nr1';
import { LOGS } from '../helpers/constants';
import { dateFormattingInLogs } from '../helpers/utils';
import LogsSub from './logsSub';

export default class Logs extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
      }
    
    logTable (data, columns) {

        return (
              <ReactTable
                data={data}
                filterable
                defaultFilterMethod={(filter, row) => row[filter.id].includes(filter.value) }
                columns={columns}
                className="-striped -highlight"
                defaultPageSize={data.length}
                showPagination={false}
                freezeWhenExpanded={true}
                style={{
                  height: "500px"
                }}
                SubComponent={(row) => {
                    return <LogsSub row={row}/>
                  }
                }
              />
          )
    }

    columns(data) {
      return Object.keys(LOGS).map(key => {
        const column = {
          Header: key,
          headerStyle: {"fontWeight": "bold"},
          accessor: key.toLowerCase(),
          Cell: row => <div><span title={row.value}>{row.value}</span></div>, // tooltip
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                fontFamily: key === "MESSAGE" ? 'Monaco,Menlo,Ubuntu Mono,Consolas,source-code-pro,monospace' : null
              }
            }
          }
        }
        if (LOGS[key].WIDTH) {
          column["width"] = LOGS[key].WIDTH
        }
        // Show only columns that should be visible
        if (!LOGS[key].VISIBLE) {
          column["show"] = false
        }
        return column
      })
    }
    
    render() {
      const { data } = this.props
      const columns = this.columns(data[0])

      return  <Grid className="logs">
                  <GridItem columnSpan={12} className="title">
                    <b>Latest Logs:</b>
                  </GridItem>
                  <GridItem columnSpan={12}>
                    {this.logTable(dateFormattingInLogs(data), columns)}
                  </GridItem>
              </Grid>
    }    
}
