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
          </section>
          <section className="container header--big run-in-container">
            <header className="run-in__header">
              Colors
            </header>
            <BlockPicker onChange={c => this.handleChange(c, undefined, 'foreground', 'default')} color={this.state.foreground.default} />
          </section>

        </article>
      </React.Fragment>
    );
  }
}
