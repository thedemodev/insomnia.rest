import React from 'react';
import SocialCards from '../components/social-cards';
import Title from '../partials/title';
import { BlockPicker } from 'react-color';
import { DEFAULT_INSOMNIA_THEME } from './default-insomnia-theme';

export default class ThemeGenerator extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = DEFAULT_INSOMNIA_THEME;
  }

  handleChange(color, areaName, layerName, themeName) {
    const hex = color.hex;
    const area = areaName ? this.state.styles[areaName] : this.state;

    const newState = {
      ...area, [layerName]: {
        ...this.state[layerName], [themeName]: hex
      }
    };

    // const layer = { [layerName]: theme };
    // const updatedState = { ...this.state };

    // if (first) {
    //   this.state[first];
    // }

    const state = { ...this.state };
    this.setState(newState);
  }

  render() {
    return (
      <React.Fragment>
        <article>
          <Title>Theme Generator</Title>
          <SocialCards title="Insomnia" summary="Theme Generator" isBanner />

          <section className="container header--big run-in-container">
            <header className="run-in__header">
              <h1 style={{ color: this.state.foreground.default }}>Theme Generator</h1>
            </header>
            <SvgPreview theme={this.state} />

          </section>
          <section className="container header--big run-in-container">
            <header className="run-in__header">
              Colors
            </header>
            <BlockPicker hide onChange={c => this.handleChange(c, undefined, 'foreground', 'default')} color={this.state.foreground.default} />
          </section>

        </article>
      </React.Fragment>
    );
  }
}

const SvgPreview = ({ theme }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 300">
      <g>
        {/* Panes */}
        <g className="theme--pane--sub">
          <rect x="0" y="0" width="100%" height="100%" fill={theme.background.default} />
          <rect
            x="25%"
            y="0"
            width="100%"
            height="10%"
            fill={theme.background.default}
          />
        </g>

        {/* Sidebar */}
        <g className="theme--sidebar--sub">
          <rect x="0" y="0" width="25%" height="100%" fill={theme.background.default} />
          <rect
            x="0"
            y="0"
            width="25%"
            height="10%"
            fill={theme.background.default}
          />
        </g>

        {/* Lines */}
        <line x1="25%" x2="100%" y1="10%" y2="10%" strokeWidth="1" stroke={theme.highlight.md} />
        <line x1="62%" x2="62%" y1="0" y2="100%" strokeWidth="1" stroke={theme.highlight.md} />
        <line x1="25%" x2="25%" y1="0" y2="100%" strokeWidth="1" stroke={theme.highlight.md} />
        <line x1="0" x2="25%" y1="10%" y2="10%" strokeWidth="1" stroke={theme.highlight.md} />

        {/* Colors */}
        <rect x="30%" y="85%" width="5%" height="8%" fill={theme.foreground.default} />
        <rect x="40%" y="85%" width="5%" height="8%" fill={theme.foreground.success} />
        <rect x="50%" y="85%" width="5%" height="8%" fill={theme.foreground.notice} />
        <rect x="60%" y="85%" width="5%" height="8%" fill={theme.foreground.warning} />
        <rect x="70%" y="85%" width="5%" height="8%" fill={theme.foreground.danger} />
        <rect x="80%" y="85%" width="5%" height="8%" fill={theme.foreground.surprise} />
        <rect x="90%" y="85%" width="5%" height="8%" fill={theme.foreground.info} />
      </g>
    </svg>
  );
};

