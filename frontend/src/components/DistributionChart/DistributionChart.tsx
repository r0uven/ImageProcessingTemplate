import styled from "styled-components";
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
  unit?: string;
  decimals?: number;
}

const Wrapper = styled.div`
  width: 100%;
`;

const Caption = styled.div`
  margin-top: 8px;

  text-align: center;

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.45);
`;

const CaptionHint = styled.div`
  margin-top: 6px;

  text-align: center;

  font-size: 12.5px;

  color: rgba(255, 255, 255, 0.58);
`;

export const DistributionChart = ({
  data,
  title,
  unit,
  decimals,
}: Props) => {
  const formatValue = (value: unknown) => {
    const numeric = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(numeric)) return String(value);

    return numeric.toLocaleString("ru-RU", {
      maximumFractionDigits: decimals ?? 2,
    });
  };

  const roundingLabel =
    decimals === undefined
      ? null
      : decimals === 0
        ? "до целых"
        : `до ${decimals} зн.`;

  const allUnique =
    data.length > 1 && data.every((point) => point.y === 1);

  return (
    <Wrapper>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 8 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.12)"
          />

          <XAxis
            dataKey="x"
            tickMargin={8}
            tickFormatter={formatValue}
            tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            stroke="rgba(255,255,255,0.25)"
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            stroke="rgba(255,255,255,0.25)"
            label={{
              value: "Количество",
              angle: -90,
              position: "insideLeft",
              fill: "rgba(255,255,255,0.5)",
              fontSize: 12,
            }}
          />

          <Tooltip
            cursor={{ fill: "rgba(58, 122, 254, 0.08)" }}
            labelFormatter={formatValue}
            contentStyle={{
              background: "#151b24",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "white",
            }}
          />

          <Bar
            dataKey="y"
            name="Количество"
            fill="#3A7AFE"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <Caption>
        Ось X: {title}
        {unit ? `, ${unit}` : ""}
        {roundingLabel ? ` · округление ${roundingLabel}` : ""} · Ось Y:
        количество пор
      </Caption>

      {allUnique && decimals !== 0 && (
        <CaptionHint>
          Все значения уникальны — уменьшите количество знаков после запятой,
          чтобы объединить близкие поры.
        </CaptionHint>
      )}
    </Wrapper>
  );
};
