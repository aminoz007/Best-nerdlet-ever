import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import {Stack, StackItem, Button} from "nr1";

export default class SearchHeader extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        data: PropTypes.object,
        onSearchClick: PropTypes.func
    };

    constructor(Props) {
        super(Props);
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
                        headerStyle: {"fontWeight": "bold"},
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
        const { data, onSearchClick } = this.props;

        return  <React.Fragment>
                  <Stack
                      alignmentType={Stack.ALIGNMENT_TYPE.FILL}
                      directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                      distributionType={Stack.DISTRIBUTION_TYPE.CENTER}
                      gapType={Stack.GAP_TYPE.EXTRA_LOOSE}>
                    <StackItem>
                      {this.tableElem(data.env, "Environment", "environment")}
                    </StackItem>
                    <StackItem>
                      {this.tableElem(data.dataCenter, "Data Center", "dcenter")}
                    </StackItem>
                    <StackItem>
                      {this.tableElem(data.logicalCluster, "Logical Cluster", "lcluster")}
                    </StackItem>
                    <StackItem>
                      {this.tableElem(data.group, "Groups", "group")}
                    </StackItem>
                    <StackItem>
                      {this.tableElem(data.name, "Name", "name")}
                    </StackItem>
                  </Stack>

                  <Button className = "button-search"
                    onClick={onSearchClick}
                    type={Button.TYPE.PRIMARY}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SEARCH}>
                    Search
                  </Button>
                </React.Fragment>
      }    
}
