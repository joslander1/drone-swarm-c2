import React from 'react';
import { Eye } from 'lucide-react';

interface Props {
  className?: string;
  message?: string;
}

const ReadOnlyBanner: React.FC<Props> = ({
  className = '',
  message = 'Public demo — this dashboard is read-only. No changes can be made to fleet data.',
}) => (
  <div
    className={`flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300 ${className}`}
  >
    <Eye className="h-3.5 w-3.5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export default ReadOnlyBanner;
