export type CardRow = {
  label: string;
  value: string;
  stacked?: boolean;
};

export type CardGroup = {
  key: string;
  title: string;
  rows: CardRow[];
};
