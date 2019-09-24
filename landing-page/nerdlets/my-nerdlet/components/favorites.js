import React from 'react';
import PropTypes from 'prop-types';
import { Button, Toast } from 'nr1';
import { downloadSelection, uploadSelection, deleteSelection } from '../helpers/nerdStorage';
 
export default class Favorites extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number
    };

    constructor(Props) {
        super(Props)
        this.state={
            favoriteSelected: false
        }
        this.onSaveFav = this.onSaveFav.bind(this)
        this.onDeletFav = this.onDeletFav.bind(this)
      }
    
    onSaveFav() {
        const { data } = this.props
        if (data && Object.keys(data.selected).filter(key =>data.selected[key].length).length) {   
            uploadSelection(data).then(() => this.setState({favoriteSelected:true}))
        } else {
            Toast.showToast({
                title: 'Selection Needed',
                description: 'Nothing to save!!',
                type: Toast.TYPE.CRITICAL
            })
        }
    }

    onDeletFav() {
        deleteSelection().then(() => this.setState({favoriteSelected:false}))
    }

    componentDidMount() {
        downloadSelection().then(result => {
            console.log(result)
            if(result && result.data) {
                this.setState({favoriteSelected:true})
                this.props.favSelected(result.data)
            } else {
                this.setState({favoriteSelected:false})
            }
        })
    }

    render() {
      return ( 
        <>
            {this.state.favoriteSelected ? 
            <Button
            className= "favorite"
            onClick={this.onDeletFav}
            type={Button.TYPE.PLAIN}
            iconType={Button.ICON_TYPE.PROFILES__EVENTS__FAVORITE__WEIGHT_BOLD}/> 
            :
            <Button
            className= "favorite"
            onClick={this.onSaveFav}
            type={Button.TYPE.PLAIN}
            iconType={Button.ICON_TYPE.PROFILES__EVENTS__FAVORITE}/>
            }
        </>
      )
    }    
}
