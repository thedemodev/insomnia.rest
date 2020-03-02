import React from 'react';
import SocialCards from '../components/social-cards';

import Link from '../components/link';
import Title from '../partials/title';
import { DEFAULT_INSOMNIA_THEME } from './default-insomnia-theme';
import ColorPicker from './color-picker';
import { Tab, Tabs } from 'react-tabify';

const themes = [
  "Default",
  "Success",
  "Notice",
  "Warning",
  "Danger",
  "Surprise",
  "Info"
];

const areas = [
  { label: "Default", key: "" },
  { label: "Dialog", key: "dialog" },
  { label: "Dialog footer", key: "dialogFooter" },
  { label: "Dialog header", key: "dialogHeader" },
  { label: "Dropdown", key: "dropdown" },
  { label: "Editor", key: "editor" },
  { label: "Link", key: "link" },
  { label: "Overlay", key: "overlay" },
  { label: "Pane", key: "pane" },
  { label: "Pane Header", key: "paneHeader" },
  { label: "Sidebar", key: "sidebar" },
  { label: "Sidebar header", key: "sidebarHeader" },
  { label: "Sidebar list", key: "sidebarList" },
  { label: "Tooltip", key: "tooltip" },
  { label: "Transparent overlay", key: "transparentOverlay" }
];

export default class ThemeGenerator extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = { theme: DEFAULT_INSOMNIA_THEME, displayName: 'My custom theme', name: 'my-custom-theme', activeKey: 0 };
  }

  handleHighlightChange(color, areaName) {
    const { theme } = this.state;
    const { rgb } = color;

    const newHighlight = {
      default: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      xxs: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
      xs: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      sm: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
      md: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
      lg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
      xl: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
    };

    if (areaName) {
      const newTheme = {
        ...theme,
        styles: {
          ...theme.styles,
          [areaName]: {
            ...theme.styles[areaName],
            highlight: newHighlight
          }
        }
      };

      this.setState({ theme: newTheme });
      return;
    }

    const newTheme = {
      ...theme,
      highlight: newHighlight
    };

    this.setState({ theme: newTheme });
  }

  handleChange(color, areaName, layerName, themeName) {
    const hex = color.hex;
    const { theme } = this.state;

    if (areaName) {
      const newTheme = {
        ...theme,
        styles: {
          ...theme.styles,
          [areaName]: {
            ...theme.styles[areaName],
            [layerName]: {
              ...theme.styles[areaName][layerName],
              [themeName]: hex
            }
          }
        }
      };

      this.setState({ theme: newTheme });
      return;
    }

    const newTheme = {
      ...theme,
      [layerName]: {
        ...theme[layerName],
        [themeName]: hex
      }
    };

    this.setState({ theme: newTheme });
  }

  handleTabSelect = activeKey => {
    this.setState({ activeKey });
  };

  render() {
    const { activeKey, theme } = this.state;
    const colorClasses = "col-3";
    const activeArea = areas[activeKey].key;
    const themeForArea = activeArea ? theme.styles[activeArea] : theme;

    return (
      <React.Fragment>
        <article>
          <Title>Theme Generator</Title>
          <SocialCards title="Insomnia" summary="Theme Generator" isBanner />

          <section className="container header--big run-in-container">
            <header className="run-in__header">
              <h1>Theme Generator</h1>
            </header>
            <SvgPreview theme={theme} />
            <InstallButton name="insomnia-plugin-custom-theme" theme={this.state} />

          </section>
          <section className="container header--big run-in-container">

            <Tabs activeKey={activeKey} onSelect={this.handleTabSelect}>
              {areas.map(({ label, key }) => (
                <Tab label={label} key={key}>
                  <div className="padding-top-sm row">

                    <div className="col-6 ml-0">
                      <h1>Foreground</h1>
                      <div className="row">
                        <ColorPicker
                          label="Text"
                          className={colorClasses}
                          onChange={c => this.handleChange(c, activeArea, 'foreground', 'default')}
                          color={themeForArea.foreground ? themeForArea.foreground.default : undefined}
                        />
                      </div>
                    </div>
                    <div className="col-6 ml-0">
                      <h1>Highlight</h1>
                      <div className="row">
                        <ColorPicker
                          label="Base"
                          className={colorClasses}
                          onChange={c => this.handleHighlightChange(c, activeArea)}
                          color={themeForArea.highlight ? themeForArea.highlight.default : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="padding-top-sm">
                    <h1>Background</h1>
                    <div className="row">
                      {themes.map(t => (
                        <ColorPicker
                          key={t}
                          className={colorClasses}
                          label={t}
                          onChange={c => this.handleChange(c, activeArea, 'background', t.toLowerCase())}
                          color={themeForArea.background ? themeForArea.background[t.toLowerCase()] : undefined}
                        />
                      ))}
                    </div>
                  </div>
                </Tab>
              ))}
            </Tabs>
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
        <rect x="30%" y="85%" width="5%" height="8%" fill={theme.background.default} />
        <rect x="40%" y="85%" width="5%" height="8%" fill={theme.background.success} />
        <rect x="50%" y="85%" width="5%" height="8%" fill={theme.background.notice} />
        <rect x="60%" y="85%" width="5%" height="8%" fill={theme.background.warning} />
        <rect x="70%" y="85%" width="5%" height="8%" fill={theme.background.danger} />
        <rect x="80%" y="85%" width="5%" height="8%" fill={theme.background.surprise} />
        <rect x="90%" y="85%" width="5%" height="8%" fill={theme.background.info} />
      </g>
    </svg>
  );
};

const InstallButton = ({ theme, name }) => {
  const fullTheme = {
    name: 'custom-theme',
    displayName: 'Custom Name',
    theme,
  };
  const main = `module.exports.themes = [${JSON.stringify(fullTheme, null, 2)}];`;

  const url = 'insomnia://plugins/create?' + [
    `name=${encodeURIComponent(name)}`,
    `main=${encodeURIComponent(main)}`,
    `version=${encodeURIComponent('1.0.0')}`,
    `theme=${encodeURIComponent(fullTheme.name)}`
  ].join('&');

  return (
    <Link to={url} className="button">
      Install
    </Link>
  );
};
