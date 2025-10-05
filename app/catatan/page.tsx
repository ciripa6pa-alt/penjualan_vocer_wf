'use client';

import { useState, useEffect } from 'react';
import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react';
import { db, Note } from '@/lib/db';
import { notifyDataChange, requestNotificationPermission } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

export default function CatatanPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    judul: '',
    isi: ''
  });

  useEffect(() => {
    loadNotes();
    requestNotificationPermission();
  }, []);

  const loadNotes = async () => {
    const data = await db.notes.getAll();
    setNotes(data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const noteData = {
      tanggal: new Date().toISOString(),
      judul: formData.judul,
      isi: formData.isi
    };

    if (editingNote) {
      await db.notes.update(editingNote.id, noteData);
      notifyDataChange('edit', 'catatan');
      toast({ title: 'Berhasil', description: 'Catatan berhasil diperbarui' });
    } else {
      await db.notes.add(noteData);
      notifyDataChange('tambah', 'catatan');
      toast({ title: 'Berhasil', description: 'Catatan berhasil ditambahkan' });
    }

    resetForm();
    loadNotes();
    setIsDialogOpen(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      judul: note.judul,
      isi: note.isi
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      await db.notes.delete(id);
      notifyDataChange('hapus', 'catatan');
      toast({ title: 'Berhasil', description: 'Catatan berhasil dihapus' });
      loadNotes();
    }
  };

  const resetForm = () => {
    setFormData({ judul: '', isi: '' });
    setEditingNote(null);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRandomGradient = (index: number) => {
    const gradients = [
      'from-blue-50 to-blue-100',
      'from-green-50 to-green-100',
      'from-purple-50 to-purple-100',
      'from-orange-50 to-orange-100',
      'from-pink-50 to-pink-100',
      'from-cyan-50 to-cyan-100'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <>
      <TopNav title="Catatan" />
      <div className="p-4 space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Catatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Catatan' : 'Tambah Catatan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="judul">Judul Catatan</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                  placeholder="Masukkan judul catatan"
                />
              </div>

              <div>
                <Label htmlFor="isi">Isi Catatan</Label>
                <Textarea
                  id="isi"
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  required
                  placeholder="Tulis catatan Anda..."
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingNote ? 'Update' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Belum Ada Catatan</p>
              <p className="text-sm mt-2">
                Klik tombol di atas untuk menambahkan catatan pertama Anda
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note, index) => (
              <Card key={note.id} className="overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className={`pb-3 bg-gradient-to-r ${getRandomGradient(index)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <StickyNote className="w-4 h-4" />
                        {note.judul}
                      </CardTitle>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDateTime(note.tanggal)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(note)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(note.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {note.isi}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
