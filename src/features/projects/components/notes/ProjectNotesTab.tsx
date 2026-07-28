/**
 * Purpose: Full ERP Notes & Communication History Tab for Project Details (Zoho Books / ERPNext style)
 * Responsibilities: Render search bar, author filter, Card/Timeline view toggle, Create Note modal (Rich Text),
 *                    Pin Note quick action, Edit Note modal, Delete action, Activity Timeline
 * Dependencies: SearchBar, Select, Button, ActionMenu, Modal, Skeleton, NoteFormModal, formatDate
 * Export: ProjectNotesTab
 */
import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Pin,
  Clock,
  LayoutGrid,
  Pencil,
  Trash2,
  Paperclip,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import { SearchBar } from '../../../../components/shared/SearchBar';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { ActionMenu } from '../../../../components/shared/ActionMenu';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { useTableState } from '../../../../hooks/useTableState';
import { useDisclosure } from '../../../../hooks/useDisclosure';
import { formatDate } from '../../../../utils/formatDate';
import { toast } from '../../../../components/ui/Toast';
import { NoteFormModal } from './NoteFormModal';
import {
  useProjectNotes,
  useCreateProjectNote,
  useUpdateProjectNote,
  useTogglePinProjectNote,
  useDeleteProjectNote,
} from '../../hooks/useProjectTabs';

import type { ProjectNote } from '../../../../types/projectTabs.types';

export interface ProjectNotesTabProps {
  projectId: string;
}

const AUTHOR_OPTIONS = [
  { value: 'All', label: 'All Authors' },
  { value: 'Ajith Kumar', label: 'Ajith Kumar' },
  { value: 'Priya Nair', label: 'Priya Nair' },
  { value: 'Rohan Sharma', label: 'Rohan Sharma font-medium' },
];

export function ProjectNotesTab({ projectId }: ProjectNotesTabProps) {
  const { search, handleSearch } = useTableState();
  const [authorFilter, setAuthorFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'card' | 'timeline'>('card');
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);

  const formModal = useDisclosure();

  // Hooks
  const notesQuery = useProjectNotes({
    projectId,
    search,
    author: authorFilter !== 'All' ? authorFilter : undefined,
  });

  const createNoteMutation = useCreateProjectNote();
  const updateNoteMutation = useUpdateProjectNote();
  const togglePinMutation = useTogglePinProjectNote();
  const deleteNoteMutation = useDeleteProjectNote();

  const handleOpenCreate = () => {
    setSelectedNote(null);
    formModal.open();
  };

  const handleOpenEdit = (note: ProjectNote) => {
    setSelectedNote(note);
    formModal.open();
  };

  const handleFormSubmit = async (values: {
    title: string;
    description: string;
    pinned: boolean;
    tags: string[];
    attachments?: { name: string; url: string }[];
  }) => {
    if (selectedNote) {
      await updateNoteMutation.mutateAsync({
        noteId: selectedNote.id,
        input: {
          title: values.title,
          description: values.description,
          pinned: values.pinned,
          tags: values.tags,
        },
      });
    } else {
      await createNoteMutation.mutateAsync({
        projectId,
        title: values.title,
        description: values.description,
        pinned: values.pinned,
        tags: values.tags,
      });
    }
    formModal.close();
  };

  const handleTogglePin = (note: ProjectNote) => {
    togglePinMutation.mutate(note.id);
  };

  const handleDelete = (note: ProjectNote) => {
    if (window.confirm(`Delete note "${note.title}"? This cannot be undone.`)) {
      deleteNoteMutation.mutate(note.id);
    }
  };

  const notesList = useMemo(() => {
    const list = notesQuery.data ?? [];
    // Pinned first, then sorted by date desc
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [notesQuery.data]);

  return (
    <div className="space-y-6">
      {/* 1. Header Controls & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            placeholder="Search note title, content, author, tags..."
            onSearch={handleSearch}
            className="sm:max-w-xs"
          />

          <div className="w-full sm:w-48">
            <Select
              placeholder="All Authors"
              options={AUTHOR_OPTIONS}
              value={authorFilter}
              onValueChange={setAuthorFilter}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Timeline View Toggle */}
          <div className="flex items-center rounded-lg border border-surface-border bg-white p-1 text-xs">
            <button
              onClick={() => setViewMode('card')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                viewMode === 'card' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Card View
              </span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                viewMode === 'timeline' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Activity Timeline
              </span>
            </button>
          </div>

          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
            Create Note
          </Button>
        </div>
      </div>

      {/* 2. Loading State */}
      {notesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface-card rounded-xl p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : notesList.length === 0 ? (
        /* Empty State */
        <div className="surface-card p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-ink-900">No project notes recorded</h3>
          <p className="text-xs text-ink-500 max-w-sm mx-auto">
            Maintain meeting notes, client feedback, and team communication history for this project.
          </p>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
            Create First Note
          </Button>
        </div>
      ) : viewMode === 'card' ? (
        /* 3. Card View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notesList.map((note) => (
            <div
              key={note.id}
              className={`surface-card flex flex-col justify-between rounded-xl border p-5 transition-all hover:shadow-md ${
                note.pinned ? 'border-primary-300 bg-primary-50/20 shadow-sm' : 'border-surface-border'
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    {note.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                        <Pin className="h-3 w-3 fill-primary-700" /> PINNED NOTE
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-ink-900 line-clamp-1">{note.title}</h4>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label: note.pinned ? 'Unpin Note' : 'Pin Note',
                        icon: <Pin className="h-4 w-4" />,
                        onClick: () => handleTogglePin(note),
                      },
                      {
                        label: 'Edit Note',
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => handleOpenEdit(note),
                      },
                      {
                        label: 'Delete Note',
                        icon: <Trash2 className="h-4 w-4" />,
                        destructive: true,
                        separatorBefore: true,
                        onClick: () => handleDelete(note),
                      },
                    ]}
                  />
                </div>

                {/* Note Description */}
                <p className="text-xs text-ink-700 line-clamp-4 leading-relaxed whitespace-pre-line">
                  {note.description}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-ink-600 border border-surface-border/60"
                      >
                        <Tag className="h-2.5 w-2.5 text-ink-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Attachments */}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="rounded-lg bg-surface-subtle p-2 space-y-1 text-xs">
                    <span className="text-[10px] font-semibold text-ink-500">Attachments:</span>
                    {note.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        onClick={() => toast.info(`Downloading attachment ${att.name}`)}
                        className="flex items-center gap-1.5 text-primary-600 text-xs font-medium cursor-pointer hover:underline"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Meta */}
              <div className="mt-4 flex items-center justify-between border-t border-surface-border/60 pt-3 text-[11px] text-ink-500">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-ink-400" />
                  {note.createdBy}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-ink-400" />
                  {formatDate(note.createdDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 4. Activity Timeline View */
        <div className="surface-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <h3 className="text-base font-semibold text-ink-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              Project Activity Timeline
            </h3>
            <span className="text-xs text-ink-500">{notesList.length} Activity Notes</span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-border">
            {notesList.map((note) => (
              <div key={note.id} className="relative group">
                {/* Node Marker */}
                <div
                  className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 bg-white transition-colors ${
                    note.pinned ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-400'
                  }`}
                />

                <div className="rounded-xl border border-surface-border bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {note.pinned && (
                          <span className="rounded bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                            PINNED
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-ink-900">{note.title}</h4>
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        Posted by <strong>{note.createdBy}</strong> on {formatDate(note.createdDate)}
                      </p>
                    </div>

                    <ActionMenu
                      items={[
                        {
                          label: note.pinned ? 'Unpin Note' : 'Pin Note',
                          icon: <Pin className="h-4 w-4" />,
                          onClick: () => handleTogglePin(note),
                        },
                        {
                          label: 'Edit Note',
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => handleOpenEdit(note),
                        },
                        {
                          label: 'Delete Note',
                          icon: <Trash2 className="h-4 w-4" />,
                          destructive: true,
                          separatorBefore: true,
                          onClick: () => handleDelete(note),
                        },
                      ]}
                    />
                  </div>

                  <p className="text-xs text-ink-700 leading-relaxed whitespace-pre-line bg-surface-subtle rounded-lg p-3 border border-surface-border/50">
                    {note.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.map((t) => (
                        <span key={t} className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-surface-border">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {note.attachments && note.attachments.length > 0 && (
                      <span className="text-[11px] text-primary-600 font-medium flex items-center gap-1">
                        <Paperclip className="h-3.5 w-3.5" /> {note.attachments.length} Attachment(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Create / Edit Note Modal */}
      <NoteFormModal
        open={formModal.isOpen}
        onOpenChange={formModal.close}
        note={selectedNote}
        onSubmit={handleFormSubmit}
        isSubmitting={createNoteMutation.isPending || updateNoteMutation.isPending}
      />
    </div>
  );
}
