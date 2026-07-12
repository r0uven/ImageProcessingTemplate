import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface Props {
  data: {
    x: number;
    y: number;
  }[];

  title: string;
}

export const DistributionChart = ({ data, title }: Props) => (
  <ResponsiveContainer width="100%" height={420}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis
        dataKey="x"
        label={{
          value: title,
          position: "insideBottom",
        }}
      />

      <YAxis
        label={{
          value: "Количество",
          angle: -90,
          position: "insideLeft",
        }}
      />

      <Tooltip />

      <Bar dataKey="y" fill="#3A7AFE" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
