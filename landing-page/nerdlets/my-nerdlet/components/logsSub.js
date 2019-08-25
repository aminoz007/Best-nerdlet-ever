import React from 'react';
import PropTypes from 'prop-types';
import 'react-table/react-table.css';
import { getLogById } from '../helpers/nerdQueries';
import { Spinner } from 'nr1';

export default class LogsSub extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.state = {
          expandedRow: null
        }
      }

    componentDidMount() {
      const { row } = this.props
      getLogById(row.original.guid, row.original.message_id).then(expandedRow => {
        console.log(expandedRow)
        console.log(row)
        this.setState({expandedRow})
      })
    }

    render() {
      return (
        <div>
          {this.state.expandedRow ? <pre style={{marginLeft: '30px'}}>{JSON.stringify(this.state.expandedRow[0], null, 4)}</pre> : <Spinner fillContainer type={Spinner.TYPE.INLINE} />}
        </div>
      )
    }    
}
