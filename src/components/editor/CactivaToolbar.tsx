import React from 'react';
import { IconButton, Tooltip, Positioner } from 'evergreen-ui';
import _ from 'lodash';

export default () => {
  return (
    <div className="cactiva-toolbar">
      {_.map(toolbar, (v: any, i) => {
        if (v.divider) {
          return <div key={i} className="divider" />;
        }
        return (
          <div key={i} className="btn-toolbar">
            <Tooltip content={v.label} position="right">
              <IconButton icon={v.icon} height={30} />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

const toolbar = [
  {
    icon: 'search',
    label: 'Search',
    component: null
  },
  {
    divider: 'primary'
  },
  {
    icon: 'font',
    label: 'Text',
    component: null
  },
  {
    icon: 'new-text-box',
    label: 'TextInput',
    component: null
  },
  {
    icon: 'widget-button',
    label: 'TouchableOpacity',
    component: null
  },
  {
    icon: 'merge-links',
    label: 'Dropdown',
    component: null
  },
  {
    icon: 'list-detail-view',
    label: 'FlatList',
    component: null
  },
  {
    icon: 'tick',
    label: 'CheckBox',
    component: null
  },
  {
    icon: 'segmented-control',
    label: 'RadioGroup',
    component: null
  },
  {
    divider: 'media'
  },
  {
    icon: 'star',
    label: 'Icon',
    component: null
  },
  {
    icon: 'media',
    label: 'Image',
    component: null
  },
  {
    divider: 'layout'
  },
  {
    icon: 'style',
    label: 'ImageBackground',
    component: null
  },
  {
    icon: 'page-layout',
    label: 'View',
    component: null
  },
  {
    icon: 'control',
    label: 'ScrollView',
    component: null
  },
  {
    divider: 'ui-kitten'
  },
  {
    icon: 'widget-footer',
    label: 'BottomNavigation',
    component: null
  },
  {
    icon: 'widget-header',
    label: 'TopNavigation',
    component: null
  },
  {
    divider: 'ui-kitten'
  },
  {
    icon: 'split-columns',
    label: 'If',
    component: null
  },
  {
    icon: 'merge-columns',
    label: 'IfElse',
    component: null
  },
  {
    icon: 'column-layout',
    label: 'Switch',
    component: null
  }
];
