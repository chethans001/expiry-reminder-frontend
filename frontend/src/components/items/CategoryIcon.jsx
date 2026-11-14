import React from 'react';
import {
  Utensils,
  Milk,
  Apple,
  Coffee,
  Pill,
  Sparkles,
  Heart,
  Smile,
  Home,
  Sparkle,
  Baby,
  Package,
  Tag,
  Folder
} from 'lucide-react';

const iconMap = {
  Utensils,
  Milk,
  Apple,
  Coffee,
  Pill,
  Sparkles,
  Heart,
  Smile,
  Home,
  Sparkle,
  Baby,
  Package,
  Tag,
  Folder
};

export default function CategoryIcon({ icon = 'Tag', color = '#6366F1', className = 'w-5 h-5' }) {
  const IconComponent = iconMap[icon] || Tag;

  return (
    <div
      className="inline-flex items-center justify-center p-2 rounded-xl transition-transform"
      style={{
        backgroundColor: `${color}18`, // 10% opacity tint
        color: color
      }}
    >
      <IconComponent className={className} />
    </div>
  );
}
