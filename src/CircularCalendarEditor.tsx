import React, { PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { PanelEditorProps, toIntegerOrUndefined } from '@grafana/data';

import { SimpleOptions } from './types';

export class CircularCalendarEditor extends PureComponent<PanelEditorProps<SimpleOptions>> {
  onTextChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, text: target.value });
  };

  onPaddingChanged = ({ target }: any) => {
    const v = toIntegerOrUndefined(target.value);
    this.props.onOptionsChange({ ...this.props.options, pad: v ? v : 40 });
  };

  render() {
    const { options } = this.props;

    return (
      <div className="section gf-form-group">
        <h5 className="section-heading">Display</h5>
        <LegacyForms.FormField
          label="Text"
          labelWidth={5}
          inputWidth={20}
          type="text"
          onChange={this.onTextChanged}
          value={options.text || ''}
        />

        <LegacyForms.FormField
          label="Padding"
          labelWidth={5}
          width={6}
          step={5}
          onChange={this.onPaddingChanged}
          value={options.pad}
          type="number"
        />

        <br />
        <br />
        <br />
        <div>TODO: center padding</div>
        <div>TODO: first day of week (monday? or sunday)</div>
      </div>
    );
  }
}
