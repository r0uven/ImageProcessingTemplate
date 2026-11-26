import { Message } from "@/shared/ui/message";
import { Hint } from "@/shared/ui/typography";

import { useStorageManager } from "../model/useStorageManager";
import { AddStorageForm } from "./AddStorageForm";
import { DeleteStorageDialog } from "./DeleteStorageDialog";
import { StorageCard } from "./StorageCard";
import * as S from "./StorageManager.styles";

type StorageManagerProps = {
  /** Вызывается после успешного изменения реестра на backend. */
  onChanged: () => Promise<void>;
};

/** Блок управления реестром хранилищ на странице настроек. */
export function StorageManager({ onChanged }: StorageManagerProps) {
  const manager = useStorageManager({ onChanged });

  return (
    <S.StorageList>
      {manager.error && (
        <Message $variant="error">{manager.error}</Message>
      )}
      {manager.notice && <Message>{manager.notice}</Message>}

      {manager.loading && (
        <Hint>Загрузка реестра хранилищ...</Hint>
      )}

      {manager.infos?.map((info) => (
        <StorageCard
          key={info.id}
          info={info}
          editing={manager.editingId === info.id}
          busy={manager.busy}
          editLabel={manager.editLabel}
          editPath={manager.editPath}
          onEditLabelChange={manager.setEditLabel}
          onEditPathChange={manager.setEditPath}
          onPickFolder={() => void manager.pickFolder("edit")}
          onStartEdit={() => manager.startEdit(info)}
          onSaveEdit={() => void manager.handleSaveEdit(info)}
          onCancelEdit={() => manager.setEditingId(null)}
          onActivate={() => void manager.handleActivate(info)}
          onDelete={() => manager.requestDelete(info)}
        />
      ))}

      <AddStorageForm
        newLabel={manager.newLabel}
        newPath={manager.newPath}
        activateNew={manager.activateNew}
        busy={manager.busy}
        onLabelChange={manager.setNewLabel}
        onPathChange={manager.setNewPath}
        onActivateChange={manager.setActivateNew}
        onPickFolder={() => void manager.pickFolder("new")}
        onAdd={() => void manager.handleAdd()}
      />

      <DeleteStorageDialog
        target={manager.deleteTarget}
        busy={manager.busy}
        deleteFiles={manager.deleteFiles}
        deleteHistory={manager.deleteHistory}
        onDeleteFilesChange={manager.setDeleteFiles}
        onDeleteHistoryChange={manager.setDeleteHistory}
        onCancel={() => manager.setDeleteTarget(null)}
        onConfirm={() => void manager.handleConfirmDelete()}
      />
    </S.StorageList>
  );
}
