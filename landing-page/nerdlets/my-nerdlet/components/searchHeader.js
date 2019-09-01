import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import {Stack, StackItem, Button} from 'nr1';
import { RFC_190_SCOPE } from '../helpers/constants';
import Favorites from './favorites';

export default class SearchHeader extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props);
        this.state = { 
          selected: {environment:[], dcenter:[], lcluster:[], group:[], name:[]},
          lastSelectedTab: null 
        }
        this.onFavSelected = this.onFavSelected.bind(this)
      }
    
    tableElem (data, header, accessor) {

        return (
            <div>
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
                    width: "300px",
                    marginTop: "40px"
                  }}
                
                // Select/Deslect rows
                getTrProps={(state, rowInfo) => {
                    if (rowInfo && rowInfo.row) {
                      return {
                        onClick: (e) => {
                          const selected =  this.state.selected
                          if (this.state.selected[accessor].indexOf(rowInfo.original[accessor]) >= 0) {
                            selected[accessor].splice(selected[accessor].indexOf(rowInfo.original[accessor]), 1)
                          } else {
                            selected[accessor].push(rowInfo.original[accessor])
                          }
                          this.setState({
                            selected: selected,
                            lastSelectedTab: accessor
                          }, () => this.props.onSelectRows(this.state))
                        },
                        style: {
                          background: this.state.selected[accessor].indexOf(rowInfo.original[accessor]) >= 0 ? '#007e8a' : 'white',
                          color: this.state.selected[accessor].indexOf(rowInfo.original[accessor]) >= 0 ? 'white' : 'black'
                        }
                      }
                    }else{
                      return {}
                    }
                }}
              />
              <br />
            </div>
          ); 
    }

    onFavSelected(selection) {
      this.setState({
        selected: selection.selected,
        lastSelectedTab: selection.lastSelectedTab
      }, () => this.props.onSelectRows(this.state))
    }

    render() {
      const { data, onSearchClick } = this.props;

      return  <React.Fragment>
                <Favorites data={this.state} favSelected={this.onFavSelected} />
                <Stack
                    alignmentType={Stack.ALIGNMENT_TYPE.FILL}
                    directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                    distributionType={Stack.DISTRIBUTION_TYPE.CENTER}
                    gapType={Stack.GAP_TYPE.EXTRA_LOOSE}>
                  <StackItem>
                    {this.tableElem(data[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR], RFC_190_SCOPE.ENVIRONMENT.HEADER, RFC_190_SCOPE.ENVIRONMENT.ACCESSOR)}
                  </StackItem>
                  <StackItem>
                    {this.tableElem(data[RFC_190_SCOPE.DATA_CENTER.ACCESSOR], RFC_190_SCOPE.DATA_CENTER.HEADER, RFC_190_SCOPE.DATA_CENTER.ACCESSOR)}
                  </StackItem>
                  <StackItem>
                    {this.tableElem(data[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR], RFC_190_SCOPE.LOGICAL_CLUSTER.HEADER, RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR)}
                  </StackItem>
                  <StackItem>
                    {this.tableElem(data[RFC_190_SCOPE.GROUP.ACCESSOR], RFC_190_SCOPE.GROUP.HEADER, RFC_190_SCOPE.GROUP.ACCESSOR)}
                  </StackItem>
                  <StackItem>
                    {this.tableElem(data[RFC_190_SCOPE.NAME.ACCESSOR], RFC_190_SCOPE.NAME.HEADER, RFC_190_SCOPE.NAME.ACCESSOR)}
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
