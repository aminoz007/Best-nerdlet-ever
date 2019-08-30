import React from 'react';
import PropTypes from 'prop-types';
import { Modal, HeadingText, BlockText, Button } from 'nr1';


export default class ModalMsg extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    }

    constructor(Props) {
        super(Props)
        this.state = {
            hidden: true,
            accountsExceedingLimit: null
        }
        this._onClose = this._onClose.bind(this)
      }

    _onClose() {
        this.setState({ hidden: true });
    }

    componentDidMount() {
        const { data } = this.props
        // There is a chance we hit the 1000 limit for Metric Name, if yes Notify the user to reduce the scope
        const accounts = data.filter(row => row.members.length === 1000).map(row => row.accountId).join(", ")
            if(accounts) {
                    this.setState({hidden:false, accountsExceedingLimit:accounts})
            }
    }

    render() {
        return (
            <>
                <Modal hidden={this.state.hidden} onClose={this._onClose}>
                  <HeadingText type='heading1'>Oops looks like we hit some limits!</HeadingText>
                  <BlockText type={BlockText.TYPE.PARAGRAPH}>
                      We can extract only 1000 Metric Names for each NR account.
                      It seems we have already reached this limit for the following accounts: 
                      <strong> {this.state.accountsExceedingLimit}</strong>.
                      Please narrow down your scope if you would like to access all available metrics.
                  </BlockText>
                  <Button onClick={this._onClose}>Close</Button>
              </Modal>
            </>
        )
    }
}
