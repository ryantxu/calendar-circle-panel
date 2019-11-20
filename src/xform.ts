import { DataFrame, ArrayVector, getTimeField, FieldType } from '@grafana/data';
import { DateTime } from 'luxon';

export interface DayBucket {
  date: DateTime;
  count: number;
  sum: number;
  scale: number; // 0-1 for min/max on sum
}

export interface DayBucketInfo {
  year: number;
  day: DayBucket[];
  outside: DayBucket;
}

export const toDayBucketsInfo = (year: number, data: DataFrame[]): DayBucketInfo => {
  const start = DateTime.local().set({
    year,
    ordinal: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  const values: DayBucket[] = [];
  for (let i = 1; i <= start.daysInYear; i++) {
    const d = start.set({ ordinal: i });
    values.push({
      date: d,
      count: 0,
      sum: 0,
      scale: 0,
    });
  }

  const outside = {
    date: start, // IGNORE
    count: 0,
    sum: 0,
    scale: 0,
  };
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  for (const frame of data) {
    const { timeField, timeIndex } = getTimeField(frame);
    if (!timeField) {
      continue;
    }
    const timeVector = timeField.values;
    for (let i = 0; i < frame.fields.length; i++) {
      if (i === timeIndex) {
        continue;
      }
      if (frame.fields[i].type === FieldType.number) {
        const vector = frame.fields[i].values;
        for (let j = 0; j < vector.length; j++) {
          const value = vector.get(j);
          if (value) {
            const time = DateTime.fromMillis(timeVector.get(j));
            const bucket = time.year !== year ? outside : values[time.ordinal - 1];
            bucket.count = bucket.count + 1;
            bucket.sum = bucket.sum + value;
            if(bucket.sum > max) {
              max = bucket.sum;
            }
            if(bucket.sum < min) {
              min = bucket.sum;
            }
          }
        }
        continue; // the first number field
      }
    }
  }

  const range = max - min;
  if(range > 0) {
    console.log('MINMAX', min, max, range); 
    for(const bucket of values) {
      if(bucket.count > 0) {
        bucket.scale = (bucket.sum-min)/range;
      }
    }
  }

  return {
    year,
    day: values,
    outside,
  };
};

export const toDayBuckets = (year: number, data: DataFrame[]): DataFrame => {
  const start = DateTime.local().set({
    year,
    ordinal: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  const dates = new ArrayVector<DateTime>();
  const weekNumber = new ArrayVector<number>(); //
  const weekday = new ArrayVector<number>(); //
  const count = new ArrayVector<number>();
  const sum = new ArrayVector<number>();

  for (let i = 1; i <= start.daysInYear; i++) {
    const d = start.set({ ordinal: i });
    dates.add(d);
    weekNumber.add(d.weekNumber);
    weekday.add(d.weekday);
    count.add(0);
    sum.add(0);
  }

  let outside = 0;
  for (const frame of data) {
    const { timeField, timeIndex } = getTimeField(frame);
    if (!timeField) {
      continue;
    }
    const timeVector = timeField.values;
    for (let i = 0; i < frame.fields.length; i++) {
      if (i === timeIndex) {
        continue;
      }
      if (frame.fields[i].type === FieldType.number) {
        const vector = frame.fields[i].values;
        for (let j = 0; j < vector.length; j++) {
          const value = vector.get(j);
          if (value) {
            const time = DateTime.fromMillis(timeVector.get(j));
            if (time.year !== year) {
              outside++;
            } else {
              const idx = time.ordinal;
              count.set(idx, count.get(idx) + 1);
              sum.set(idx, sum.get(idx) + value);
            }
          }
        }
        continue; // the first number field
      }
    }
  }

  return {
    fields: [
      { name: 'Date', values: dates, config: {}, type: FieldType.other },
      { name: 'Week', values: weekNumber, config: {}, type: FieldType.number },
      { name: 'Day', values: weekday, config: {}, type: FieldType.number },
      { name: 'Count', values: count, config: {}, type: FieldType.number },
      { name: 'Sum', values: sum, config: {}, type: FieldType.number },
    ],
    length: dates.length,
    meta: {
      outside, // Someplace more general?
    },
  };
};
