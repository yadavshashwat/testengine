
import React, { Component } from 'react';

import { colors } from '@atlaskit/theme';
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import { AutoDismissFlag, FlagGroup } from '@atlaskit/flag';

//Redux
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";

const color = {
    error: colors.R400,
    info: colors.N500,
    normal: colors.N0,
    success: colors.G400,
    warning: colors.Y200,
};


class AutoDismissFlagCom extends Component{
    
    
    handleDismiss = () => {        
        this.props.actions.dismissFlag({});
    };

    render() {
        // console.log(this.state.flags)
        
        return (
            <FlagGroup onDismissed={this.handleDismiss}>
                
                {this.props.flagsList.map((flag,key) => {
                    return (
                        <AutoDismissFlag
                            appearance={flag.appearance}
                            id={key}
                            icon={
                                <SuccessIcon
                                    label="Success"
                                    size="medium"
                                    secondaryColor={color[flag.appearance]}
                                />
                            }
                            key={key}
                            title={flag.message}
                        />
                    );
                })}
            </FlagGroup>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators({ ...flag }, dispatch)
    };
  }
  


function mapStateToProps(store) {
    return {
      ...store.flag
    };
  }
  

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(AutoDismissFlagCom);
  