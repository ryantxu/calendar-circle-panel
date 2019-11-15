import React, { PureComponent } from 'react';
import { PanelProps, toFixed } from '@grafana/data';
import { SimpleOptions } from 'types';
import { DateTime } from 'luxon';
import { css } from 'emotion';
import { CanvasMouseCallback, CanvasElement } from 'CanvasElement';

interface Props extends PanelProps<SimpleOptions> {}

export const colors = [
  '#7EB26D', // 0: pale green
  '#EAB839', // 1: mustard
  '#6ED0E0', // 2: light blue
  '#EF843C', // 3: orange
  '#E24D42', // 4: red
  '#1F78C1', // 5: ocean
  '#BA43A9', // 6: purple
  '#705DA0', // 7: violet
  '#508642', // 8: dark green
  '#CCA300', // 9: dark sand
  '#447EBC',
  '#C15C17',
  '#890F02',
  '#0A437C',
  '#6D1F62',
  '#584477',
  '#B7DBAB',
  '#F4D598',
  '#70DBED',
  '#F9BA8F',
  '#F29191',
  '#82B5D8',
  '#E5A8E2',
  '#AEA2E0',
  '#629E51',
  '#E5AC0E',
  '#64B0C8',
  '#E0752D',
  '#BF1B00',
];

interface TTipSpot {
  mouseX: number;
  mouseY: number;
  date: DateTime;
}

interface State {
  x: number;
  y: number;
  theta: number;
  radius: number;
  hover?: TTipSpot;
}

export class CircularCalendarPanel extends PureComponent<Props, State> {
  state: State = {
    x: 0,
    y: 0,
    theta: 0,
    radius: 0,
  };

  onMouseEvent = (info: CanvasMouseCallback) => {
    const { width, height, options } = this.props;
    const { pad } = options;

    const x = info.x.offset - width / 2;
    const y = (info.y.offset - height / 2) * -1;

    let theta = Math.atan2(y, x) * -1 + Math.PI / 2;
    if (theta < 0) {
      theta += Math.PI * 2; // ATAN2 is -PI/PI
    }

    const radius = Math.sqrt(x * x + y * y);
    const size = Math.min(width, height) / 2 - 15;
    if (radius > size + 20 || radius < pad - 10) {
      this.setState({ x, y, theta, radius: -1, hover: undefined });
      return;
    }
    const scale = (radius - pad) / (size - pad);

    const start = DateTime.local().set({
      ordinal: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const week = Math.floor((theta / (Math.PI * 2)) * start.weeksInWeekYear);
    let weekday = Math.ceil(scale * 7);
    if (scale < 0.1) {
      weekday = 1;
    } else if (scale > 0.9) {
      weekday = 7;
    }

    const hover = {
      mouseX: info.event.clientX,
      mouseY: info.event.clientY,
      date: start.set({
        weekNumber: week,
        weekday: weekday,
      }),
    };

    this.setState({ x, y, theta, radius: scale, hover });
  };

  draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear the background
    ctx.fillStyle = '#333';
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.font = '14px "Open Sans", Helvetica, Arial, sans-serif';

    if (true) {
      // Move the axis to the middle
      ctx.transform(
        1, // Horizontal scaling. A value of 1 results in no scaling.
        0, // Vertical skewing.
        0, // Horizontal skewing.
        -1, // Vertical scaling. A value of 1 results in no scaling.
        width / 2, // Horizontal translation (moving).
        height / 2 // Vertical translation (moving).
      );

      const pad = this.props.options.pad;
      const size = Math.min(width, height) / 2 - 15 - pad;
      const start = DateTime.local().set({
        ordinal: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      const sel = this.state.hover ? this.state.hover.date.toSQLDate() : null;

      for (let i = 1; i <= start.daysInYear; i++) {
        const d = start.set({ ordinal: i });

        const weekPercent = d.weekNumber / start.weeksInWeekYear;
        const dayPercent = (d.weekday - 1) / 6;

        const theta = weekPercent * 2 * Math.PI * -1 + Math.PI / 2;
        const distance = pad + dayPercent * size;

        const x = distance * Math.cos(theta);
        const y = distance * Math.sin(theta);

        const radius = 5;

        ctx.beginPath();
        ctx.strokeStyle = colors[d.month];
        if (d.toSQLDate() === sel) {
          ctx.strokeStyle = '#F00';
        }
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (false) {
        //this.state.radius > 0) {
        const { theta } = this.state;

        const distance = this.state.radius;
        const x = distance * Math.cos(theta);
        const y = distance * Math.sin(theta);

        const radius = 15;

        ctx.beginPath();
        ctx.strokeStyle = '#F00'; //colors[d.month];
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  renderTooltip = (hover: TTipSpot) => {
    return (
      <div
        className={css`
          position: fixed;
          padding: 10px;
          border: 1px solid black;
          z-index: 5000;
          background: #333;
        `}
        style={{
          top: hover.mouseY + 10,
          left: hover.mouseX + 10,
        }}
      >
        {hover.date.toLocaleString(DateTime.DATE_FULL)}
      </div>
    );
  };

  render() {
    const { width, height } = this.props;
    const { state } = this;

    return (
      <div
        style={{
          position: 'relative',
          width,
          height,
          cursor: this.state.hover ? 'pointer' : '',
        }}
      >
        <div
          className={css`
            position: absolute;
            top: 0;
            left: 0;
          `}
        >
          <CanvasElement {...state} draw={this.draw} onMouseEvent={this.onMouseEvent} width={width} height={height} />
        </div>

        <div
          className={css`
            position: absolute;
            bottom: 0;
            left: 0;
            padding: 10px;
          `}
        >
          <div>
            x,y: ({state.x}, {state.y})
          </div>
          <div>
            φ,r: ({toFixed(state.theta, 3)}, {toFixed(state.radius, 3)})
          </div>
        </div>

        {this.state.hover && this.renderTooltip(this.state.hover)}
      </div>
    );
  }
}
