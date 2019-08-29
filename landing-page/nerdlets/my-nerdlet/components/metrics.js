import React from 'react';
import PropTypes from 'prop-types';
import 'react-table/react-table.css';
import {Stack, StackItem} from 'nr1';
import { arrangeIntoTree } from '../helpers/treeStruct';
import TreeMenu from 'react-simple-tree-menu';

export default class Metrics extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.actionHandler = this.actionHandler.bind(this)
      }
    
    actionHandler(node) {
        if(!node.hasNodes) {
            // Display dashboard
            console.log(node)
            const parent = node.parent.split('/').pop()
            const metricName = parent.concat('.',node.label)
            console.log(metricName)
        }
    }
    
    render() {

        const { data } = this.props
        console.log(arrangeIntoTree(data))
        return  <Stack
                    alignmentType={Stack.ALIGNMENT_TYPE.FILL}
                    directionType={Stack.DIRECTION_TYPE.VERTICAL} 
                    distributionType={Stack.DISTRIBUTION_TYPE.CENTER}
                    gapType={Stack.GAP_TYPE.NONE}
                    className="logs">
                    <StackItem className="title">
                        <b>Metrics:</b>
                    </StackItem>
                    <StackItem>
                        <TreeMenu data={arrangeIntoTree(data)} onClickItem={this.actionHandler} hasSearch={true}/>
                    </StackItem>
                    </Stack>
    }    
}
