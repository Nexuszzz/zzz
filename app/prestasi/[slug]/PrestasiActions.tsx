'use client';

import { Button } from '@/components/ui';
import { ExternalLink, Download, Share2 } from 'lucide-react';

interface PrestasiActionsProps {
  sumberBerita?: string;
  sertifikat?: string;
  title: string;
}

export function PrestasiActions({ sumberBerita, sertifikat, title }: PrestasiActionsProps) {
  const handleOpenBerita = () => {
    if (sumberBerita) {
      window.open(sumberBerita, '_blank');
    }
  };

  const handleDownloadSertifikat = () => {
    if (sertifikat) {
      window.open(sertifikat, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  return (
    <div className="space-y-3">
      {sumberBerita && (
        <Button 
          variant="primary" 
          fullWidth
          leftIcon={<ExternalLink className="w-4 h-4" />}
          onClick={handleOpenBerita}
        >
          Lihat Berita Resmi
        </Button>
      )}
      {sertifikat && (
        <Button 
          variant="outline" 
          fullWidth
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleDownloadSertifikat}
        >
          Download Sertifikat
        </Button>
      )}
      <Button 
        variant="ghost" 
        fullWidth
        leftIcon={<Share2 className="w-4 h-4" />}
        onClick={handleShare}
      >
        Bagikan Prestasi
      </Button>
    </div>
  );
}
