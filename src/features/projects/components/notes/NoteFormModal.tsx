/**
 * Purpose: Create/Edit Project Note Modal with Rich Text formatting toolbar and tags
 * Responsibilities: Render title input, formatting bar (bold, italic, list, link, code), tag picker, pin toggle, attachments
 * Dependencies: Modal, Button, Input, Select, Lucide Icons
 * Export: NoteFormModal
 */
import React, { useState, useEffect } from 'react';
import { Bold, Italic, List, Code, Link, Pin, Paperclip, X } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { ProjectNote } from '../../../../types/projectTabs.types';

export interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: ProjectNote | null;
  onSubmit: (values: { title: string; description: string; pinned: boolean; tags: string[]; attachments?: { name: string; url: string }[] }) => Promise<void>;
  isSubmitting?: boolean;
}

const PRESET_TAGS = ['Kickoff', 'Requirement', 'DevOps', 'UAT', 'Finance', 'Billing', 'Meeting Notes', 'General'];

export function NoteFormModal({ open, onOpenChange, note, onSubmit, isSubmitting }: NoteFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>(['General']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setDescription(note.description);
      setPinned(note.pinned);
      setTags(note.tags || ['General']);
      setAttachments(note.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setPinned(false);
      setTags(['General']);
      setAttachments([]);
    }
  }, [note, open]);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFormatText = (prefix: string, suffix: string = '') => {
    setDescription((prev) => `${prev}${prefix}formatted text${suffix}`);
  };

  const handleAddSampleAttachment = () => {
    const nextNum = attachments.length + 1;
    setAttachments([...attachments, { name: `Project_Attachment_${nextNum}.pdf`, url: '#' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      pinned,
      tags: tags.length > 0 ? tags : ['General'],
      attachments,
    });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={note ? 'Edit Project Note' : 'Create New Project Note'} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Title Input */}
          <Input
            label="Note Title"
            required
            placeholder="e.g. Client Kickoff Call Summary & Requirements"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description with Rich Text Formatting Toolbar */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-ink-700">Communication Note / Description</label>
            <div className="rounded-xl border border-surface-border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 border-b border-surface-border bg-surface-bg px-3 py-1.5 text-ink-600 text-xs">
                <button
                  type="button"
                  onClick={() => handleFormatText('**', '**')}
                  className="rounded p-1 hover:bg-white hover:text-ink-900 transition-colors"
                  title="Bold (**text**)"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('*', '*')}
                  className="rounded p-1 hover:bg-white hover:text-ink-900 transition-colors"
                  title="Italic (*text*)"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('\n- ')}
                  className="rounded p-1 hover:bg-white hover:text-ink-900 transition-colors"
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('`', '`')}
                  className="rounded p-1 hover:bg-white hover:text-ink-900 transition-colors"
                  title="Inline Code"
                >
                  <Code className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('[Link Title](https://example.com)')}
                  className="rounded p-1 hover:bg-white hover:text-ink-900 transition-colors"
                  title="Hyperlink"
                >
                  <Link className="h-3.5 w-3.5" />
                </button>
              </div>

              <textarea
                rows={5}
                required
                className="w-full px-3 py-2 text-sm focus:outline-none bg-transparent"
                placeholder="Write detailed notes, meeting minutes, technical decisions, or client updates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Tags Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink-700">Tags / Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((pt) => {
                const active = tags.includes(pt);
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => (active ? handleRemoveTag(pt) : handleAddTag(pt))}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      active ? 'bg-primary-600 text-white' : 'bg-surface-subtle text-ink-600 hover:bg-surface-border'
                    }`}
                  >
                    {pt}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom tag..."
                className="rounded-lg border border-surface-border px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(customTagInput);
                  }
                }}
              />
              <Button type="button" variant="secondary" className="text-xs py-1 h-7" onClick={() => handleAddTag(customTagInput)}>
                Add Tag
              </Button>
            </div>

            {/* Selected Tags list */}
            <div className="flex flex-wrap gap-1 pt-1">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {t}
                  <X className="h-3 w-3 cursor-pointer hover:text-primary-900" onClick={() => handleRemoveTag(t)} />
                </span>
              ))}
            </div>
          </div>

          {/* Pin & Attachments Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-surface-border pt-3">
            <label className="flex items-center gap-2 text-xs font-medium text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-border text-primary-600 focus:ring-primary-500"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <span className="flex items-center gap-1">
                <Pin className={`h-3.5 w-3.5 ${pinned ? 'text-primary-600 fill-primary-600' : 'text-ink-400'}`} />
                Pin Note to top of project feed
              </span>
            </label>

            <Button
              type="button"
              variant="secondary"
              className="text-xs"
              leftIcon={<Paperclip className="h-3.5 w-3.5" />}
              onClick={handleAddSampleAttachment}
            >
              Attach Document ({attachments.length})
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="rounded-lg bg-surface-subtle p-2 space-y-1 text-xs">
              <span className="text-ink-500 font-medium">Attachments:</span>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-1 text-ink-700 border border-surface-border">
                    <Paperclip className="h-3 w-3 text-primary-600" />
                    {att.name}
                    <X
                      className="h-3 w-3 cursor-pointer text-ink-400 hover:text-red-600"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
