import {
  Card,
  Field,
  Grid,
  Section,
  SectionTitle,
  Toggle,
} from "./ProcessingSettings.styled";

export type ProcessingSettingsState = {
  preprocessing: {
    denoise: boolean;
    normalize: boolean;
    contrastEnhancement: boolean;
    smoothing: boolean;
    filterSize: number;
  };
  postprocessing: {
    removeSmallObjects: boolean;
    minObjectArea: number;
    fillHoles: boolean;
    morphologyEnabled: boolean;
    morphologyOperation: string;
    kernelSize: number;
  };
  objectDetection: { connectivity: 4 | 8; minObjectArea: number };
  poreSeparation: {
    enabled: boolean;
    validateResult: boolean;
    keepUnseparated: boolean;
  };
};

type ProcessingSettingsProps = ProcessingSettingsState & {
  onChange: <T extends keyof ProcessingSettingsState>(
    section: T,
    field: keyof ProcessingSettingsState[T],
    value: ProcessingSettingsState[T][keyof ProcessingSettingsState[T]],
  ) => void;
};

export function ProcessingSettings({
  preprocessing,
  postprocessing,
  objectDetection,
  poreSeparation,
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
        <SectionTitle>Постобработка</SectionTitle>

        <Grid>
          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={postprocessing.removeSmallObjects}
                onChange={(e) =>
                  onChange(
                    "postprocessing",
                    "removeSmallObjects",
                    e.target.checked,
                  )
                }
              />
              <span>Удалять мелкие объекты</span>
            </Toggle>

            <Field>
              <label>Мин. площадь</label>
              <input
                type="number"
                min={1}
                value={postprocessing.minObjectArea}
                onChange={(e) =>
                  onChange(
                    "postprocessing",
                    "minObjectArea",
                    Number(e.target.value),
                  )
                }
              />
            </Field>
          </Card>

          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={postprocessing.fillHoles}
                onChange={(e) =>
                  onChange("postprocessing", "fillHoles", e.target.checked)
                }
              />
              <span>Заполнение отверстий</span>
            </Toggle>
          </Card>

          <Card>
            <Toggle>
              <input
                type="checkbox"
                checked={postprocessing.morphologyEnabled}
                onChange={(e) =>
                  onChange(
                    "postprocessing",
                    "morphologyEnabled",
                    e.target.checked,
                  )
                }
              />
              <span>Морфология</span>
            </Toggle>

            {postprocessing.morphologyEnabled && (
              <>
                <Field>
                  <label>Операция</label>
                  <select
                    value={postprocessing.morphologyOperation}
                    onChange={(e) =>
                      onChange(
                        "postprocessing",
                        "morphologyOperation",
                        e.target.value,
                      )
                    }
                  >
                    <option value="opening">Opening</option>
                    <option value="closing">Closing</option>
                    <option value="erosion">Erosion</option>
                    <option value="dilation">Dilation</option>
                  </select>
                </Field>

                <Field>
                  <label>Kernel</label>
                  <input
                    type="number"
                    min={1}
                    value={postprocessing.kernelSize}
                    onChange={(e) =>
                      onChange(
                        "postprocessing",
                        "kernelSize",
                        Number(e.target.value),
                      )
                    }
                  />
                </Field>
              </>
            )}
          </Card>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Анализ объектов</SectionTitle>

        <Grid>
          <Card>
            <Field>
              <label>Связность</label>
              <select
                value={objectDetection.connectivity}
                onChange={(e) =>
                  onChange(
                    "objectDetection",
                    "connectivity",
                    Number(e.target.value) as 4 | 8,
                  )
                }
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </Field>

            <Field>
              <label>Мин. площадь</label>
              <input
                type="number"
                min={1}
                value={objectDetection.minObjectArea}
                onChange={(e) =>
                  onChange(
                    "objectDetection",
                    "minObjectArea",
                    Number(e.target.value),
                  )
                }
              />
            </Field>
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
                checked={poreSeparation.enabled}
                onChange={(e) =>
                  onChange("poreSeparation", "enabled", e.target.checked)
                }
              />
              <span>Включено</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={poreSeparation.validateResult}
                onChange={(e) =>
                  onChange("poreSeparation", "validateResult", e.target.checked)
                }
              />
              <span>Валидация</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={poreSeparation.keepUnseparated}
                onChange={(e) =>
                  onChange(
                    "poreSeparation",
                    "keepUnseparated",
                    e.target.checked,
                  )
                }
              />
              <span>Сохранять неразделённые</span>
            </Toggle>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
