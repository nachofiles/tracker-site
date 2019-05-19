import React from 'react';
import { Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import { RootStore } from '../../store/rootStore';

const TruncatedText: React.FC<{ maxWidth?: number, tooltip?: string, children: any }> = ({ tooltip, children, maxWidth = 80 }) => (
  <div style={{ textOverflow: 'ellipsis', maxWidth, overflowX: 'hidden' }} title={tooltip}>
    {children}
  </div>
);

@inject('store')
@observer
class EnsResolver extends React.Component<{ address: string, store?: RootStore }> {
  componentDidUpdate(prevProps: Readonly<{ address: string; store: RootStore }>) {
    if (prevProps.address !== this.props.address) {
      this.props.store!.ensStore.resolveName(this.props.address);
    }
  }

  componentDidMount(): void {
    this.props.store!.ensStore.resolveName(this.props.address);
  }

  render() {
    const { address, store } = this.props;

    const { isLoading: { [ address ]: isLoading }, ensNames: { [ address ]: name } } = store!.ensStore;

    if (name) {
      return (
        <a href={`https://manager.ens.domains/name/${name}`} rel="nofollow noopener" target="_blank">
          {name}
        </a>
      );
    }

    if (isLoading) {
      return <Spin/>;
    }

    return <TruncatedText tooltip={address}>{address}</TruncatedText>;
  }
}

export default EnsResolver;
export { TruncatedText };