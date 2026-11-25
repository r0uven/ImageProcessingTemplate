import * as S from "./SettingsPage.styles";

type SettingsActionBarProps = {
  saving: boolean;
  error: string | null;
  dirty: boolean;
  onReset: () => void;
  onSave: () => void;
};

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

      <S.Button
        type="button"
        onClick={onReset}
        disabled={!dirty || saving}
      >
        Сбросить изменения
      </S.Button>

      <S.Button
        $primary
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
      >
        {saving ? "Сохранение..." : "Сохранить"}
      </S.Button>
    </S.ActionBar>
  );
}
