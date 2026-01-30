'use client';

import { HTMLAttributes, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge, VerifiedBadge } from './Badge';
import { Button } from './Button';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';

// Base Card Component
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl shadow-card overflow-hidden',
          hoverable && 'transition-shadow duration-300 hover:shadow-card-hover',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card untuk Lomba - sesuai mockup
export interface LombaCardProps {
  id: string;
  slug: string;
  title: string;
  deadline?: string | null;
  deadlineDisplay?: string | null;
  kategori: string;
  tingkat: string;
  status: 'open' | 'closed' | 'coming-soon';
  image?: string;
  posterUrl?: string | null;
  isUrgent?: boolean;
  isFree?: boolean;
}

const LombaCard = ({
  slug,
  title,
  deadline,
  deadlineDisplay,
  kategori,
  tingkat,
  status,
  image,
  posterUrl,
  isUrgent,
  isFree,
}: LombaCardProps) => {
  const imageUrl = image || posterUrl;
  return (
    <Card className="flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white/80 text-4xl font-bold">
              {title.charAt(0)}
            </span>
          </div>
        )}
        {/* Status Badge - top right */}
        <div className="absolute top-3 right-3">
          <Badge variant={status} size="sm">
            {status === 'open' ? 'Open' : status === 'coming-soon' ? 'Coming Soon' : 'Closed'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Deadline */}
        <div className={cn(
          'flex items-center gap-1.5 text-xs mb-2',
          isUrgent ? 'text-accent font-semibold' : 'text-text-muted'
        )}>
          <Clock className="w-3.5 h-3.5" />
          <span>Deadline: {deadlineDisplay}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-text-main mb-2 line-clamp-2 flex-1">
          {title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant={tingkat.toLowerCase() as 'nasional' | 'internasional' | 'regional'} size="sm">
            {tingkat}
          </Badge>
          {isFree && (
            <Badge variant="gratis" size="sm">Gratis</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/lomba/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" fullWidth>
              Detail
            </Button>
          </Link>
          <Link href={`/lomba/${slug}#daftar`} className="flex-1">
            <Button variant="primary" size="sm" fullWidth>
              Daftar
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

// Card untuk Prestasi - sesuai mockup
interface PrestasiCardProps {
  id?: string;
  slug?: string;
  title?: string;
  namaLomba?: string;
  peringkat: string;
  tingkat: string;
  tahun?: string;
  tim?: Array<{ nama: string; nim?: string }>;
  fakultas?: string;
  prodi?: string;
  kategori?: string;
  foto?: string;
  isVerified?: boolean;
}

const PrestasiCard = ({
  slug,
  title,
  namaLomba,
  peringkat,
  tingkat,
  tahun,
  tim,
  fakultas,
  prodi,
  kategori,
  foto,
  isVerified,
}: PrestasiCardProps) => {
  const getPeringkatColor = (peringkat: string) => {
    if (peringkat.toLowerCase().includes('juara 1') || peringkat.toLowerCase().includes('gold')) {
      return 'from-yellow-400 to-yellow-600';
    }
    if (peringkat.toLowerCase().includes('juara 2') || peringkat.toLowerCase().includes('silver')) {
      return 'from-gray-300 to-gray-500';
    }
    if (peringkat.toLowerCase().includes('juara 3') || peringkat.toLowerCase().includes('bronze')) {
      return 'from-orange-400 to-orange-600';
    }
    return 'from-primary to-primary-600';
  };

  const content = (
    <Card className="flex flex-col h-full p-4">
      {/* Header with medal color */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
          getPeringkatColor(peringkat)
        )}>
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant={tingkat.toLowerCase() as 'nasional' | 'internasional' | 'regional'} size="sm" className="mb-1">
            {tingkat}
          </Badge>
          <p className="text-sm font-semibold text-text-main">{peringkat}</p>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-text-main mb-1 line-clamp-2">
        {title || namaLomba}
      </h4>
      
      {/* Team members */}
      {tim && tim.length > 0 && (
        <p className="text-sm text-text-muted mb-2 line-clamp-1">
          {tim.map(t => t.nama).join(', ')}
        </p>
      )}

      {/* Footer info */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="line-clamp-1">{fakultas || prodi}</span>
          {tahun && <span>{tahun}</span>}
        </div>
      </div>
    </Card>
  );

  if (slug) {
    return <Link href={`/prestasi/${slug}`}>{content}</Link>;
  }

  return content;
};

// Card untuk Expo - sesuai mockup
interface ExpoCardProps {
  id?: string;
  slug: string;
  title: string;
  tanggal: string;
  lokasi: string;
  image?: string;
  posterUrl?: string | null;
}

const ExpoCard = ({
  slug,
  title,
  tanggal,
  lokasi,
  image,
  posterUrl,
}: ExpoCardProps) => {
  const imageUrl = image || posterUrl;
  return (
    <Card className="flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary flex items-center justify-center">
            <span className="text-white/80 text-3xl font-bold">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-text-main mb-2 line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center gap-1.5 text-sm text-text-muted mb-1">
          <Calendar className="w-4 h-4" />
          <span>{tanggal}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{lokasi}</span>
        </div>

        {/* Action */}
        <div className="mt-4">
          <Badge variant="primary" size="sm">
            Agenda
          </Badge>
        </div>
      </div>
    </Card>
  );
};

// Statistik Card
interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const StatCard = ({ value, label, icon }: StatCardProps) => {
  return (
    <div className="text-center p-4">
      {icon && <div className="text-primary mb-2">{icon}</div>}
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
};

export { Card, LombaCard, PrestasiCard, ExpoCard, StatCard };
