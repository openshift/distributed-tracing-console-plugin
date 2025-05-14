import React from 'react';
import { Bullseye } from '@patternfly/react-core';

export function LoadingState() {
  return (
    <Bullseye>
      <div className="co-m-loader co-an-fade-in-out" data-test="loading-indicator">
        <div className="co-m-loader-dot__one" />
        <div className="co-m-loader-dot__two" />
        <div className="co-m-loader-dot__three" />
      </div>
    </Bullseye>
  );
}
