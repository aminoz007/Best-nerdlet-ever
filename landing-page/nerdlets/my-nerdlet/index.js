import { AutoSizer, NerdletStateContext, PlatformStateContext } from "nr1";

import MyNerdlet from "./root";
import React from "react";

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <AutoSizer>
                {({ width, height }) => (
                  <MyNerdlet
                    height={height}
                    launcherUrlState={platformUrlState}
                    nerdletUrlState={nerdletUrlState}
                    width={width}
                  />
                )}
              </AutoSizer>
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}