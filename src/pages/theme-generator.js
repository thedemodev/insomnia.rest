import React from 'react';
import SocialCards from '../components/social-cards';

import Link from '../components/link';
import Title from '../partials/title';
import { DEFAULT_INSOMNIA_THEME } from './default-insomnia-theme';
import ColorPicker from './color-picker';
import { Tab, Tabs } from 'react-tabify';

const themes = [
  'Default',
  'Success',
  'Notice',
  'Warning',
  'Danger',
  'Surprise',
  'Info',
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

    this.state = {
      theme: DEFAULT_INSOMNIA_THEME,
      displayName: 'Custom Theme',
      name: 'custom-theme',
      activeKey: 0,
    };
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
              [themeName]: hex,
            },
          },
        },
      };

      this.setState({ theme: newTheme });
      return;
    }

    const newTheme = {
      ...theme,
      [layerName]: {
        ...theme[layerName],
        [themeName]: hex,
      },
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

          <section className="container header--big run-in-container padding-bottom-lg padding-top">
            <div className="row">
              <div className="col-6">
                <h1>Theme Generator</h1>
                <p>Create a theme to use in Insomnia.</p>
                <ul>
                  <li>Install Insomnia 7.2.0+</li>
                  <li>Select your favorite colors 🎨</li>
                  <li>Click "Install"</li>
                  <li>Enjoy your new theme!</li>
                </ul>
              </div>
              <div className="col-6">
                <SvgPreview theme={theme} />
              </div>
            </div>
          </section>
          <section className="container header--big run-in-container">

            <Tabs activeKey={activeKey} onSelect={this.handleTabSelect}>
              {areas.map(({ label, key }) => (
                <Tab label={label} key={key}>
                  <div className="padding-top-sm">
                    <h1>Foreground</h1>
                    <div className="row">
                      <ColorPicker
                        className={colorClasses}
                        label="Text color"
                        onChange={c => this.handleChange(c, activeArea, 'foreground', 'default')}
                        color={themeForArea.foreground ? themeForArea.foreground.default : undefined}
                      />
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

                  <div className="padding-top-sm">
                    <h1>Highlight</h1>
                    <div className="row">
                      <ColorPicker
                        className={colorClasses}
                        label={label}
                        onChange={c => this.handleHighlightChange(c, activeArea)}
                        color={themeForArea.highlight ? themeForArea.highlight.default : undefined}
                      />
                    </div>
                  </div>
                </Tab>
              ))}
            </Tabs>
            <div className="right pt-4">
              <InstallButton name="insomnia-plugin-custom-theme" theme={this.state} />
            </div>
          </section>
        </article>
      </React.Fragment>
    );
  }
}

const SvgPreview = ({ theme }) => {
  console.log('HELLO', theme);
  const sidebar = theme.styles.sidebar;
  const sidebarH = theme.styles.sidebarHeader || {};
  const pane = theme.styles.pane || {};
  const paneH = theme.styles.paneHeader || {};

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 300" style={{
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow: `0 0 30px -10px ${theme.background.default}`,
    }}>
      <g>
        {/* Panes */}
        <g>
          <rect x="0" y="0" width="100%" height="100%" fill={(pane.background || {}).default} />
          <rect
            x="25%"
            y="0"
            width="100%"
            height="10%"
            fill={(paneH.background || {}).default}
          />
        </g>

        {/* Sidebar */}
        <g>
          <rect x="0" y="0" width="25%" height="100%" fill={(sidebar.background || {}).default} />
          <rect
            x="0"
            y="0"
            width="25%"
            height="10%"
            fill={(sidebarH.background || {}).default}
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

const InstallButton = ({ theme }) => {
  const main = `module.exports.themes = [${JSON.stringify(theme, null, 2)}];`;

  const url = 'insomnia://plugins/create?' + [
    `name=${encodeURIComponent('insomnia-plugin-' + theme.name)}`,
    `main=${encodeURIComponent(main)}`,
    `version=${encodeURIComponent('1.0.0')}`,
    `theme=${encodeURIComponent(theme.name)}`,
  ].join('&');

  return (
    <Link to={url} className="button button--big">
      Install Theme
    </Link>
  );
};
