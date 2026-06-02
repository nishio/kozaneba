export const _dummy: number[] = [];

export const dev_make_heavy = () => {
  if (import.meta.env.PROD) return;

  const N = 1000;
  for (let i = 0; i < N; i++) {
    _dummy.push(i);
  }
  for (let i = 0; i < N; i++) {
    _dummy.pop();
  }
};

export const dev_log = (...args: any[]) => {
  if (import.meta.env.PROD) return;
  console.log.apply(console, args);
};

export const dev_time = (label: string) => {
  if (import.meta.env.PROD) return;
  console.time.apply(console, [label]);
};

export const dev_time_end = (label: string) => {
  if (import.meta.env.PROD) return;
  console.timeEnd.apply(console, [label]);
};
