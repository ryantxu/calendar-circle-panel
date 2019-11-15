import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
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

interface State {
  x: number;
  y: number;
  theta: number;
  radius: number;
}

export class CircularCalendarPanel extends PureComponent<Props, State> {
  state: State = {
    x: 0,
    y: 0,
    theta: 0,
    radius: -10,
  };

  onMouseEvent = (info: CanvasMouseCallback) => {
    const { width, height } = this.props;
    const x = info.x.offset - width / 2;
    const y = (info.y.offset - height / 2) * -1;

    const theta = Math.atan2(y, x);
    let radius = Math.sqrt(x * x + y * y);

    const size = Math.min(width, height) / 2;
    if (radius > size) {
      radius = -1;
    }

    this.setState({ x, y, theta, radius });
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

      const size = Math.min(width, height) / 2 - 15;
      const start = DateTime.local().set({
        ordinal: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      const pad = 30;
      for (let i = 1; i <= start.daysInYear; i++) {
        const d = start.set({ ordinal: i });

        const theta = 2 * Math.PI * (d.weekNumber / start.weeksInWeekYear) - Math.PI / 2; // rotate so jan is at the top
        const distance = pad + ((d.weekday - 1) / 6) * (size - pad);
        const x = distance * Math.cos(theta);
        const y = distance * Math.sin(theta);

        const radius = 2 + Math.random() * 5;

        ctx.beginPath();
        ctx.strokeStyle = '#CCC'; //colors[d.month];
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // const ttip = <div>{d.toRFC2822()}<br/>{d.toSQLDate()}</div>

        // elements.push(
        //   <Tooltip key={i} placement="top" content={ ttip }>
        //     <circle style={{ fill:  }} r={radius} cx={x} cy={y} />
        //   </Tooltip>
        // );
      }

      if (this.state.radius > 0) {
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

  render() {
    const { width, height } = this.props;
    const { x, y } = this.state;

    return (
      <div
        style={{
          position: 'relative',
          width,
          height,
        }}
      >
        <div
          className={css`
            position: absolute;
            top: 0;
            left: 0;
          `}
        >
          <CanvasElement {...this.state} draw={this.draw} onMouseEvent={this.onMouseEvent} width={width} height={height} />
        </div>

        <div
          className={css`
            position: absolute;
            top: 0;
            right: 0;
            padding: 10px;
          `}
        >
          <div>
            {x}, {y}
          </div>
        </div>
      </div>
    );
  }
}
