"use client";

import { useMemo, useState } from "react";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { useContactSearch } from "../queries/warehouses.queries";
import { useDebounce } from "../../../shared/hooks/use-debounce";
import type {
  ISearchSystemUser,
  ISearchContact,
} from "../types/warehouses.types";

export interface IFullNameSearchOption {
  id: string;
  fullName: string;
  email: string | null;
  phone?: string;
  userId?: string | null;
  type: "user" | "contact" | "create";
  key: string;
}

interface IFullNameComboboxProps {
  value: string;
  onSelectPerson: (person: IFullNameSearchOption) => void;
  disabled?: boolean;
  error?: string;
}

export function FullNameCombobox({
  value,
  onSelectPerson,
  disabled,
  error,
}: IFullNameComboboxProps) {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  // Fetch search results from API (only when search has >= 2 chars)
  const { data: searchResults, isLoading } = useContactSearch(debouncedSearch, {
    enabled: debouncedSearch.trim().length >= 2,
  });

  const groupedOptions = useMemo(() => {
    const groups = [];

    // If there is an initial value, we pre-populate it under a Selected group
    // so that the select dropdown trigger displays it even before query searches execute.
    if (value) {
      groups.push({
        groupLabel: "Selected Person",
        options: [
          {
            id: "initial_val",
            fullName: value,
            email: "",
            phone: "",
            userId: null,
            type: "contact" as const,
            key: "initial_val",
          },
        ],
      });
    }

    if (searchResults) {
      if (searchResults.systemUsers && searchResults.systemUsers.length > 0) {
        const filteredUsers = searchResults.systemUsers.filter(
          (u) => u.fullName !== value,
        );
        if (filteredUsers.length > 0) {
          groups.push({
            groupLabel: "System Users",
            options: filteredUsers.map((u: ISearchSystemUser) => ({
              id: u.id,
              fullName: u.fullName,
              email: u.email,
              phone: undefined,
              userId: u.id,
              type: "user" as const,
              key: `user_${u.id}`,
            })),
          });
        }
      }
      if (searchResults.contacts && searchResults.contacts.length > 0) {
        const filteredContacts = searchResults.contacts.filter(
          (c) => c.fullName !== value,
        );
        if (filteredContacts.length > 0) {
          groups.push({
            groupLabel: "Existing Contacts",
            options: filteredContacts.map((c: ISearchContact) => ({
              id: c.id,
              fullName: c.fullName,
              email: c.email || "",
              phone: c.phone,
              userId: c.userId || null,
              type: "contact" as const,
              key: `contact_${c.id}`,
            })),
          });
        }
      }
    }

    // Always append the "+ Create New Contact" option if search has value
    if (search.trim()) {
      groups.push({
        groupLabel: "Create New",
        options: [
          {
            id: "create_new",
            fullName: `+ Create New Contact "${search.trim()}"`,
            email: "",
            phone: "",
            userId: null,
            type: "create" as const,
            key: "create_new",
          },
        ],
      });
    }

    return groups;
  }, [searchResults, search, value]);

  const getOptionLabel = (option: IFullNameSearchOption) => {
    if (option.type === "create") {
      return option.fullName;
    }
    if (option.type === "user") {
      return `${option.fullName} (${option.email})`;
    }
    const emailStr = option.email ? ` (${option.email})` : "";
    const phoneStr = option.phone ? ` • ${option.phone}` : "";
    return `${option.fullName}${emailStr}${phoneStr}`;
  };

  const getOptionValue = (option: IFullNameSearchOption) => option.key;

  const emptyMessage = useMemo(() => {
    if (search.trim().length < 2) {
      return "Type at least 2 characters to search";
    }
    return isLoading ? "Searching..." : "No results found.";
  }, [search, isLoading]);

  // Find currently selected option key. Since the initial value option is always present,
  // we default to "initial_val" to make UISelect match it.
  const currentValue = useMemo(() => {
    if (!value) return undefined;
    return "initial_val";
  }, [value]);

  return (
    <UISelect
      mode="single"
      label="Full Name"
      required
      placeholder="Type to search system users or contacts..."
      options={groupedOptions}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      value={currentValue || ""}
      onValueChange={(val) => {
        if (!val) {
          onSelectPerson({
            id: "",
            fullName: "",
            email: "",
            phone: "",
            userId: null,
            type: "create",
            key: "",
          });
          return;
        }
        for (const group of groupedOptions) {
          const item = group.options.find((o) => o.key === val);
          if (item) {
            if (item.type === "create") {
              onSelectPerson({
                ...item,
                fullName: search.trim(),
              });
            } else {
              onSelectPerson(item);
            }
            break;
          }
        }
      }}
      onSearchChange={setSearch}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      searchable
      disabled={disabled}
      error={error}
    />
  );
}
