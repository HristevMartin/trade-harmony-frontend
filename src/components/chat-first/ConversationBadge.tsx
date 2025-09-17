import React from 'react';
import { Badge } from '@/components/ui/badge';
import { COPY_STRINGS } from './constants';

const ConversationBadge: React.FC = () => {
  return (
    <Badge 
      variant="secondary" 
      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
    >
      {COPY_STRINGS.BADGE_TEXT}
    </Badge>
  );
};

export default ConversationBadge;
