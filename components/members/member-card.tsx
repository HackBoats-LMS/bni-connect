'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDistance } from '@/lib/utils';
import type { NearbyMember, AvailabilityStatus } from '@/lib/types';

interface MemberCardProps {
  member: NearbyMember;
  index?: number;
}

export function MemberCard({ member, index = 0 }: MemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link href={`/profile/${member.id}`} className="block group">
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red/20 transition-all duration-300">
          <div className="flex items-start gap-4">
            <Avatar name={member.name} avatar={member.avatar} size="lg" showStatus status={member.availability} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-primary truncate group-hover:text-red transition-colors">{member.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-secondary text-sm font-medium">
                    <Briefcase size={14} className="shrink-0" />
                    <span className="truncate">{member.profession}</span>
                  </div>
                </div>
                <StatusBadge status={member.availability as AvailabilityStatus} />
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-muted font-medium">
                <span className="flex items-center gap-1.5"><Building2 size={14} />{member.company}</span>
                {member.city && <span className="flex items-center gap-1.5"><MapPin size={14} />{member.city}</span>}
              </div>

              {member.distance !== undefined && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-light text-red text-xs font-bold">
                    <MapPin size={12} /> {formatDistance(member.distance)} away
                  </span>
                  <span className="text-xs font-semibold text-secondary flex items-center gap-1 group-hover:text-red transition-colors">
                    View Profile <ChevronRight size={14} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
