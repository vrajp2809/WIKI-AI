import { Note } from '../../models';
import { ApiError } from '../../utils/apiError';
import { NoteModel } from '../../models/mongo';

export class NotesService {
  async create(
    userId: string,
    data: { title: string; content: string; topic?: string; tags: string[] }
  ): Promise<Note> {
    const note = await NoteModel.create({
      userId,
      title: data.title,
      content: data.content,
      topic: data.topic ?? null,
      tags: data.tags,
    });
    return this.mapNote(note);
  }

  async getAll(userId: string): Promise<Note[]> {
    const notes = await NoteModel.find({ userId }).sort({ updatedAt: -1 });
    return notes.map(this.mapNote);
  }

  async update(
    noteId: string,
    userId: string,
    data: Partial<{ title: string; content: string; topic: string; tags: string[] }>
  ): Promise<Note> {
    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId },
      {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.topic !== undefined ? { topic: data.topic } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
      },
      { new: true },
    );
    if (!note) throw new ApiError(404, 'NOTE_NOT_FOUND', 'Note not found');
    return this.mapNote(note);
  }

  async delete(noteId: string, userId: string): Promise<void> {
    const result = await NoteModel.deleteOne({ _id: noteId, userId });
    if (!result.deletedCount) throw new ApiError(404, 'NOTE_NOT_FOUND', 'Note not found');
  }

  private mapNote(row: any): Note {
    return {
      id: row.id,
      userId: String(row.userId),
      topic: row.topic,
      title: row.title,
      content: row.content,
      tags: row.tags ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
