import { Button } from "@/shared/ui/button";

import * as S from "./StorageForms.styles";

type AddStorageFormProps = {
  newLabel: string;
  newPath: string;
  activateNew: boolean;
  busy: string | null;
  onLabelChange: (value: string) => void;
  onPathChange: (value: string) => void;
  onActivateChange: (value: boolean) => void;
  onPickFolder: () => void;
  onAdd: () => void;
};

export function AddStorageForm({
  newLabel,
  newPath,
  activateNew,
  busy,
  onLabelChange,
  onPathChange,
  onActivateChange,
  onPickFolder,
  onAdd,
}: AddStorageFormProps) {
  return (
    <S.StorageForm>
      <S.FormTitle>Добавить хранилище</S.FormTitle>

      <S.FormRow>
        <S.FormInput
          value={newLabel}
          placeholder="Название (необязательно)"
          onChange={(event) => onLabelChange(event.target.value)}
        />
      </S.FormRow>

      <S.FormRow>
        <S.FormInput
          value={newPath}
          placeholder="Путь к папке, например D:\images"
          onChange={(event) => onPathChange(event.target.value)}
        />

        <Button
          type="button"
          $variant="secondary"
          $size="sm"
          disabled={busy !== null}
          onClick={onPickFolder}
        >
          Выбрать папку…
        </Button>
      </S.FormRow>

      <S.FormRow>
        <S.CheckboxRow
          style={{
            width: "auto",
            border: "none",
            background: "transparent",
            padding: 0,
          }}
        >
          <S.Checkbox
            type="checkbox"
            checked={activateNew}
            onChange={(event) => onActivateChange(event.target.checked)}
          />
          <span>Сделать активным для новых загрузок</span>
        </S.CheckboxRow>
      </S.FormRow>

      <S.FormHint>
        Новые изображения сохраняются только в активное хранилище. Изображения
        из остальных зарегистрированных хранилищ остаются доступными в истории,
        метриках и превью.
      </S.FormHint>

      <S.FormActions>
        <Button
          type="button"
          $variant="primary"
          $size="sm"
          disabled={busy !== null}
          onClick={onAdd}
        >
          {busy === "add" ? "Добавление..." : "Добавить"}
        </Button>
      </S.FormActions>
    </S.StorageForm>
  );
}
