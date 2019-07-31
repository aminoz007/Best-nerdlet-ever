import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import {Stack, StackItem} from "nr1";

export default class SearchFilter extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    };

    constructor() {
        super();
        this.state = {
          data: {env: [{environment:"lolriot"},{environment:"lolriotdev"},{environment:"lolriotQa"},{environment:"dev"}], 
                 cluster: [{cluster:"pdx2"}, {cluster:"mia1"}, {cluster:"euc1"}],
                 logicalCluster: [{lcluster:"prod"},{lcluster:"na1"},{lcluster:"br1"},{lcluster:"la2"}],
                 group: [{group:"platform"}, {group:"cap"}, {group:"missions"}]  }
        };
      }
    
    tableElem (data, header) {

        return (
            <div style={{ height: "10px" }}>
              <ReactTable
                data={data}
                filterable
                defaultFilterMethod={(filter, row) => {
                  console.log(row)
                  String(row[filter.id]) === filter.value }
                }
                columns={[
   
                      {
                        Header: header,
                        accessor: "environment",
                        filterMethod: (filter, row) => {
                          console.log(row[filter.id])
                          console.log(filter.value)
                          row[filter.id].startsWith(filter.value)}
                      }
    
                ]}
                className="-striped -highlight"
              />
              <br />
            </div>
          ); 
    }

    render() {
        const { data } = this.state;

        return <Stack
                    alignmentType={Stack.ALIGNMENT_TYPE.FILL}
                    directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                    distributionType={Stack.DISTRIBUTION_TYPE.FILL_EVENLY}
                    gapType={Stack.GAP_TYPE.EXTRA_LOOSE}>
                        <StackItem>
                            {this.tableElem(data.env, "Environment")}
                        </StackItem>
                        <StackItem>
                            {this.tableElem(data.cluster, "Cluster")}
                        </StackItem>
                        <StackItem>
                            {this.tableElem(data.logicalCluster, "Cluster Logical")}
                        </StackItem>
                        <StackItem>
                            {this.tableElem(data.group, "Groups")}
                        </StackItem>
                </Stack>
      }    

}
