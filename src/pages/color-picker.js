import React from 'react';
import { BlockPicker } from 'react-color';

const popUpColorPickerStyle = hex => ({
  container: {
    position: 'relative',
    display: 'block',
  },
  color: {
    width: '28px',
    height: '14px',
    borderRadius: '2px',
    background: hex,
  },
  label: {
    margin: '0px 0px 0px 12px',
    paddingBottom: '3px',
  },
  swatch: {
    padding: '4px',
    background: '#fff',
    borderRadius: '1px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  popover: {
    marginTop: '10px',
    position: 'absolute',
    zIndex: '2',
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
});

export default class ColorPicker extends React.Component {
  state = {
    displayColorPicker: false,
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  render() {
    const { color, onChange, label, className } = this.props;
    const styles = popUpColorPickerStyle(color);
    return (
      <div className={className} style={{display: 'flex', alignItems: 'center'}}>
        <div style={styles.container}>
          <div style={styles.swatch} onClick={this.handleClick}>
            <div style={styles.color} />
          </div>
          {this.state.displayColorPicker ? (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={this.handleClose} />
              <BlockPicker color={color} onChange={onChange} />
            </div>

          ) : null}
        </div>
        <h5 style={styles.label}>{label}</h5>
      </div>
    );
  }
}
