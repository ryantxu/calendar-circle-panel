import { PanelPlugin } from '@grafana/data';
import { SimpleOptions, defaults } from './types';
import { CircularCalendarPanel } from './CircularCalendarPanel';
import { CircularCalendarEditor } from './CircularCalendarEditor';

export const plugin = new PanelPlugin<SimpleOptions>(CircularCalendarPanel)
  .setDefaults(defaults)
  .setEditor(CircularCalendarEditor);
