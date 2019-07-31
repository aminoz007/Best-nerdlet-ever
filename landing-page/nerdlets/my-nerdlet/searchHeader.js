import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import {Stack, StackItem} from "nr1";

export default class SearchHeader extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    };

    constructor() {
        super();
        this.state = {
          data: {env: [{environment:"lolriot"},{environment:"lolriotdev"},{environment:"lolriotQa"},{environment:"dev"},{environment:"globalqa"},{environment:"globaldev"},{environment:"prod"},{environment:"globalprod"}], 
                 cluster: [{cluster:"pdx2"}, {cluster:"mia1"}, {cluster:"euc1"}],
                 logicalCluster: [{lcluster:"prod"},{lcluster:"na1"},{lcluster:"br1"},{lcluster:"la2"}],
                 group: [{group:"platform"}, {group:"cap"}, {group:"missions"}]  }
        };
      }
    
    tableElem (data, header, accessor) {

        return (
            <div style={{ height: "10px", marginTop: "20px" }}>
              <ReactTable
                data={data}
                filterable
                defaultFilterMethod={(filter, row) => row[filter.id].startsWith(filter.value) }
                columns={[
                      {
                        Header: header,
                        headerStyle: {"font-weight": "bold"},
                        accessor: accessor,
                      }
                ]}
                className="-striped -highlight"
                defaultPageSize={data.length}
                showPagination={false}
                style={{
                    height: "300px", // This will force the table body to overflow and scroll, since there is not enough room
                    width: "300px"
                  }}
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
                    distributionType={Stack.DISTRIBUTION_TYPE.CENTER}
                    gapType={Stack.GAP_TYPE.EXTRA_LOOSE}>
                        <StackItem>
                            {this.tableElem(data.env, "Environment", "environment")}
                        </StackItem>
                        <StackItem>
                            {this.tableElem(data.cluster, "Cluster", "cluster")}
                        </StackItem>
                        <StackItem>
                            {this.tableElem(data.logicalCluster, "Cluster Logical", "lcluster")}
                        </StackItem>
                        <StackItem>
                            {this.tableElem(data.group, "Groups", "group")}
                        </StackItem>
                </Stack>
      }    

}
