import { DECIMALS_OPTIONS } from "@/shared/lib/decimals";

import { Control, Select } from "./DecimalsSelect.styles";

type DecimalsSelectProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  label?: string;
};

/** Выбор количества знаков после запятой для таблиц и графиков. */
export function DecimalsSelect({
  id,
  value,
  onChange,
  label = "Знаков после запятой",
}: DecimalsSelectProps) {
  return (
    <Control htmlFor={id}>
      {label}
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {DECIMALS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </Control>
  );
}
