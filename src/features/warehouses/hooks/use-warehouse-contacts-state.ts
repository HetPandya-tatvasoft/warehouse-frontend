import { useEffect, useMemo, useRef, useState } from "react";
import type { IWarehouseContactUpsert } from "../types/warehouses.types";

interface IUseWarehouseContactsStateProps {
  fields: { id: string }[];
  contactsList: Partial<IWarehouseContactUpsert>[];
  isManagingContacts?: boolean; // details screen uses this flag to reset edit mode
}

export function useWarehouseContactsState({
  fields,
  contactsList,
  isManagingContacts = true,
}: IUseWarehouseContactsStateProps) {
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);

  const selectedIndex = useMemo(() => {
    const idx = fields.findIndex((f) => f.id === selectedContactId);
    return idx !== -1 ? idx : 0;
  }, [fields, selectedContactId]);

  const contactsListWithFallback = useMemo(() => contactsList || [], [contactsList]);

  // Sync selected contact index fallback
  useEffect(() => {
    if (fields.length > 0) {
      const exists = fields.some((f) => f.id === selectedContactId);
      if (!exists) {
        const defaultIdx = fields.findIndex(
          (_, idx) => contactsListWithFallback[idx]?.isDefault,
        );
        const targetIdx = defaultIdx !== -1 ? defaultIdx : 0;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedContactId(fields[targetIdx]?.id || fields[0]?.id);
      }
    } else {
      setSelectedContactId("");
    }
  }, [fields, selectedContactId, contactsListWithFallback]);

  // Keep track of fields length to automatically select the newly added contact
  const prevLengthRef = useRef(fields.length);
  useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      setSelectedContactId(fields[fields.length - 1].id);
    }
    prevLengthRef.current = fields.length;
  }, [fields]);

  // Sync name edit mode state when selected tab changes or editing mode toggles
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEditingName(false);
  }, [selectedContactId, selectedIndex, isManagingContacts]);

  // Check if current contact is incomplete
  const isCurrentContactIncomplete = useMemo(() => {
    if (fields.length === 0) return false;
    const current = contactsListWithFallback[selectedIndex];
    if (!current) return false;
    return (
      !current.fullName?.trim() ||
      !current.phone?.trim() ||
      !current.email?.trim()
    );
  }, [contactsListWithFallback, selectedIndex, fields.length]);

  return {
    selectedContactId,
    setSelectedContactId,
    selectedIndex,
    isEditingName,
    setIsEditingName,
    contactsListWithFallback,
    isCurrentContactIncomplete,
  };
}
