import { Button } from "@/shared/ui/button";

import * as S from "./SettingsPage.styles";

type SettingsActionBarProps = {
  saving: boolean;
  error: string | null;
  dirty: boolean;
  onReset: () => void;
  onSave: () => void;
};

/** Нижняя панель с состоянием сохранения и кнопками сброса/сохранения. */
export function SettingsActionBar({
  saving,
  error,
  dirty,
  onReset,
  onSave,
}: SettingsActionBarProps) {
  return (
    <S.ActionBar>
      <S.ActionBarStatus $dirty={dirty} $error={Boolean(error)}>
        {saving
          ? "Сохранение..."
          : error
            ? "Не удалось сохранить настройки"
            : dirty
              ? "Есть несохранённые изменения"
              : "Все изменения сохранены"}
      </S.ActionBarStatus>

      <Button
        type="button"
        $variant="secondary"
        onClick={onReset}
        disabled={!dirty || saving}
      >
        Сбросить изменения
      </Button>

      <Button
        type="button"
        $variant="primary"
        onClick={onSave}
        disabled={!dirty || saving}
      >
        {saving ? "Сохранение..." : "Сохранить"}
      </Button>
    </S.ActionBar>
  );
}
