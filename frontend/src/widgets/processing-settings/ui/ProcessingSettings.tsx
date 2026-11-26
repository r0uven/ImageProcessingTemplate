import type { ProcessingSettingsState } from "@/entities/workspace";
import { Checkbox, CheckboxRow, Input, Select } from "@/shared/ui/field";

import {
  Card,
  Field,
  FieldLabel,
  Grid,
  Section,
  SectionTitle,
} from "./ProcessingSettings.styled";

type ProcessingSettingsProps = ProcessingSettingsState & {
  onChange: <T extends keyof ProcessingSettingsState>(
    section: T,
    field: keyof ProcessingSettingsState[T],
    value: ProcessingSettingsState[T][keyof ProcessingSettingsState[T]],
  ) => void;
};

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <CheckboxRow>
      <Checkbox
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </CheckboxRow>
  );
}

/** Панель настроек обработки: предобработка, сегментация и разделение пор. */
export function ProcessingSettings({
  preprocessing,
  segmentation,
  separation,
  onChange,
}: ProcessingSettingsProps) {
  return (
    <>
      <Section>
        <SectionTitle>Предобработка</SectionTitle>

        <Grid>
          <Card>
            <Toggle
              label="Удаление шума"
              checked={preprocessing.denoise}
              onChange={(checked) =>
                onChange("preprocessing", "denoise", checked)
              }
            />

            <Toggle
              label="Нормализация"
              checked={preprocessing.normalize}
              onChange={(checked) =>
                onChange("preprocessing", "normalize", checked)
              }
            />

            <Toggle
              label="Контраст"
              checked={preprocessing.contrastEnhancement}
              onChange={(checked) =>
                onChange("preprocessing", "contrastEnhancement", checked)
              }
            />

            <Toggle
              label="Сглаживание"
              checked={preprocessing.smoothing}
              onChange={(checked) =>
                onChange("preprocessing", "smoothing", checked)
              }
            />

            {preprocessing.smoothing && (
              <Field>
                <FieldLabel>Размер фильтра</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={preprocessing.filterSize}
                  onChange={(event) =>
                    onChange(
                      "preprocessing",
                      "filterSize",
                      Number(event.target.value),
                    )
                  }
                />
              </Field>
            )}
          </Card>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Сегментация</SectionTitle>

        <Grid>
          <Card>
            <Field>
              <FieldLabel>Метод</FieldLabel>
              <Select
                value={segmentation.method}
                onChange={(event) =>
                  onChange("segmentation", "method", event.target.value)
                }
              >
                <option value="threshold">Пороговая</option>
                <option value="neural">Нейросеть</option>
              </Select>
            </Field>

            {segmentation.method === "threshold" && (
              <>
                <Field>
                  <FieldLabel>Порог</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={segmentation.threshold.thresholdValue}
                    onChange={(event) =>
                      onChange("segmentation", "threshold", {
                        ...segmentation.threshold,
                        thresholdValue: Number(event.target.value),
                      })
                    }
                  />
                </Field>

                <Toggle
                  label="Инверсия"
                  checked={segmentation.threshold.invert}
                  onChange={(checked) =>
                    onChange("segmentation", "threshold", {
                      ...segmentation.threshold,
                      invert: checked,
                    })
                  }
                />
              </>
            )}
          </Card>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Разделение пор</SectionTitle>

        <Grid>
          <Card>
            <Toggle
              label="Включено"
              checked={separation.enabled}
              onChange={(checked) =>
                onChange("separation", "enabled", checked)
              }
            />

            <Toggle
              label="Только кандидаты"
              checked={separation.applyOnlyToCandidates}
              onChange={(checked) =>
                onChange("separation", "applyOnlyToCandidates", checked)
              }
            />

            <Toggle
              label="Сохранять автономные"
              checked={separation.preserveAutonomousPores}
              onChange={(checked) =>
                onChange("separation", "preserveAutonomousPores", checked)
              }
            />

            <Toggle
              label="Сохранять неразделённые"
              checked={separation.keepUnseparatedCandidates}
              onChange={(checked) =>
                onChange("separation", "keepUnseparatedCandidates", checked)
              }
            />

            <Toggle
              label="Валидация результата"
              checked={separation.validateSeparationResult}
              onChange={(checked) =>
                onChange("separation", "validateSeparationResult", checked)
              }
            />
          </Card>
        </Grid>
      </Section>
    </>
  );
}
