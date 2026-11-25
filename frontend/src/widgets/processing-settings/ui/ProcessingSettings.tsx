import type { ProcessingSettingsState } from "@/entities/workspace";
import {
  Card,
  Field,
  Grid,
  Section,
  SectionTitle,
  Toggle,
} from "./ProcessingSettings.styled";

type ProcessingSettingsProps = ProcessingSettingsState & {
  onChange: <T extends keyof ProcessingSettingsState>(
    section: T,
    field: keyof ProcessingSettingsState[T],
    value: ProcessingSettingsState[T][keyof ProcessingSettingsState[T]],
  ) => void;
};

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
            <Toggle>
              <input
                type="checkbox"
                checked={preprocessing.denoise}
                onChange={(e) =>
                  onChange("preprocessing", "denoise", e.target.checked)
                }
              />
              <span>Удаление шума</span>
            </Toggle>
          </Card>

          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={preprocessing.normalize}
                onChange={(e) =>
                  onChange("preprocessing", "normalize", e.target.checked)
                }
              />
              <span>Нормализация</span>
            </Toggle>
          </Card>

          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={preprocessing.contrastEnhancement}
                onChange={(e) =>
                  onChange(
                    "preprocessing",
                    "contrastEnhancement",
                    e.target.checked,
                  )
                }
              />
              <span>Контраст</span>
            </Toggle>
          </Card>

          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={preprocessing.smoothing}
                onChange={(e) =>
                  onChange("preprocessing", "smoothing", e.target.checked)
                }
              />
              <span>Сглаживание</span>
            </Toggle>

            {preprocessing.smoothing && (
              <Field>
                <label>Размер фильтра</label>
                <input
                  type="number"
                  min={1}
                  value={preprocessing.filterSize}
                  onChange={(e) =>
                    onChange(
                      "preprocessing",
                      "filterSize",
                      Number(e.target.value),
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
              <label>Метод</label>
              <select
                value={segmentation.method}
                onChange={(e) =>
                  onChange("segmentation", "method", e.target.value)
                }
              >
                <option value="threshold">Пороговая</option>
                <option value="neural">Нейросеть</option>
              </select>
            </Field>

            {segmentation.method === "threshold" && (
              <>
                <Field>
                  <label>Порог</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={segmentation.threshold.thresholdValue}
                    onChange={(e) =>
                      onChange("segmentation", "threshold", {
                        ...segmentation.threshold,
                        thresholdValue: Number(e.target.value),
                      })
                    }
                  />
                </Field>

                <Toggle>
                  <input
                    type="checkbox"
                    checked={segmentation.threshold.invert}
                    onChange={(e) =>
                      onChange("segmentation", "threshold", {
                        ...segmentation.threshold,
                        invert: e.target.checked,
                      })
                    }
                  />
                  <span>Инверсия</span>
                </Toggle>
              </>
            )}
          </Card>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Разделение пор</SectionTitle>

        <Grid>
          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={separation.enabled}
                onChange={(e) =>
                  onChange("separation", "enabled", e.target.checked)
                }
              />
              <span>Включено</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={separation.applyOnlyToCandidates}
                onChange={(e) =>
                  onChange(
                    "separation",
                    "applyOnlyToCandidates",
                    e.target.checked,
                  )
                }
              />
              <span>Только кандидаты</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={separation.preserveAutonomousPores}
                onChange={(e) =>
                  onChange(
                    "separation",
                    "preserveAutonomousPores",
                    e.target.checked,
                  )
                }
              />
              <span>Сохранять автономные</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={separation.keepUnseparatedCandidates}
                onChange={(e) =>
                  onChange(
                    "separation",
                    "keepUnseparatedCandidates",
                    e.target.checked,
                  )
                }
              />
              <span>Сохранять неразделённые</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={separation.validateSeparationResult}
                onChange={(e) =>
                  onChange(
                    "separation",
                    "validateSeparationResult",
                    e.target.checked,
                  )
                }
              />
              <span>Валидация результата</span>
            </Toggle>
          </Card>
        </Grid>
      </Section>
    </>
  );
}