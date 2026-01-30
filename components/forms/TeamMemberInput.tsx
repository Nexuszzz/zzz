'use client';

import { Plus, Trash2, User } from 'lucide-react';
import { FormField } from './FormField';
import { Button } from '@/components/ui';

export interface TeamMember {
  nama: string;
  nim: string;
  role: 'ketua' | 'anggota';
  angkatan?: string;
  whatsapp?: string;
}

interface TeamMemberInputProps {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  maxMembers?: number;
  errors?: { [key: string]: string };
}

export function TeamMemberInput({
  members,
  onChange,
  maxMembers = 6,
  errors = {},
}: TeamMemberInputProps) {
  const addMember = () => {
    if (members.length < maxMembers) {
      onChange([
        ...members,
        { nama: '', nim: '', role: 'anggota', angkatan: '' },
      ]);
    }
  };

  const removeMember = (index: number) => {
    // Can't remove ketua (index 0)
    if (index === 0) return;
    onChange(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = members.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Anggota Tim <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500">
          {members.length}/{maxMembers} anggota
        </span>
      </div>

      <div className="space-y-4">
        {members.map((member, index) => (
          <div
            key={index}
            className="relative p-4 border rounded-lg bg-gray-50"
          >
            {/* Role Badge */}
            <div className="absolute -top-2 left-3 px-2 py-0.5 bg-white border rounded text-xs font-medium">
              {member.role === 'ketua' ? (
                <span className="text-primary">Ketua Tim</span>
              ) : (
                <span className="text-gray-600">Anggota {index}</span>
              )}
            </div>

            {/* Remove Button (not for ketua) */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeMember(index)}
                className="absolute -top-2 right-3 p-1 bg-white border rounded hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField
                label="Nama Lengkap"
                value={member.nama}
                onChange={(e) => updateMember(index, 'nama', e.target.value)}
                placeholder="Nama lengkap"
                required
                error={errors[`members.${index}.nama`]}
              />
              <FormField
                label="NIM"
                value={member.nim}
                onChange={(e) => updateMember(index, 'nim', e.target.value)}
                placeholder="1234567890"
                required
                error={errors[`members.${index}.nim`]}
              />
              <FormField
                label="Angkatan"
                value={member.angkatan || ''}
                onChange={(e) => updateMember(index, 'angkatan', e.target.value)}
                placeholder="2023"
              />
              <FormField
                label="WhatsApp"
                value={member.whatsapp || ''}
                onChange={(e) => updateMember(index, 'whatsapp', e.target.value)}
                placeholder="08xxxxxxxxxx"
                hint={index === 0 ? 'Wajib untuk ketua tim' : 'Opsional'}
                error={errors[`members.${index}.whatsapp`]}
              />
            </div>
          </div>
        ))}
      </div>

      {members.length < maxMembers && (
        <Button
          type="button"
          variant="outline"
          onClick={addMember}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Anggota
        </Button>
      )}
    </div>
  );
}
