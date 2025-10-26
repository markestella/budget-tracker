'use client';

import React from 'react';
import Card from './ui/Card';
import Typography from './ui/Typography';
import { useTheme } from './ThemeProvider';

interface FeatureCardProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description: string;
  linkText?: string;
  gradientType: 'primary' | 'success' | 'warning' | 'accent';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon,
  emoji, 
  title, 
  description, 
  linkText, 
  gradientType 
}) => {
  const { isDark } = useTheme();

  const getIconColors = () => {
    if (isDark) {
      return {
        primary: 'text-white [&_svg]:text-white [&_svg]:stroke-white',
        success: 'text-white [&_svg]:text-white [&_svg]:stroke-white',
        warning: 'text-white [&_svg]:text-white [&_svg]:stroke-white',
        accent: 'text-white [&_svg]:text-white [&_svg]:stroke-white'
      };
    } else {
      return {
        primary: 'text-black [&_svg]:text-black [&_svg]:stroke-black',
        success: 'text-black [&_svg]:text-black [&_svg]:stroke-black',
        warning: 'text-black [&_svg]:text-black [&_svg]:stroke-black',
        accent: 'text-black [&_svg]:text-black [&_svg]:stroke-black'
      };
    }
  };

  const getLinkColors = () => {
    if (isDark) {
      return {
        primary: 'text-blue-400 hover:text-blue-300',
        success: 'text-green-400 hover:text-green-300',
        warning: 'text-orange-400 hover:text-orange-300',
        accent: 'text-purple-400 hover:text-purple-300'
      };
    } else {
      return {
        primary: 'text-blue-600 hover:text-blue-700',
        success: 'text-green-600 hover:text-green-700',
        warning: 'text-orange-600 hover:text-orange-700',
        accent: 'text-purple-600 hover:text-purple-700'
      };
    }
  };

  const iconColors = getIconColors();
  const linkColors = getLinkColors();

  return (
    <Card variant="feature" gradientType={gradientType}>
      {icon && (
        <div className={`${iconColors[gradientType]} mb-6`}>
          {icon}
        </div>
      )}
      {emoji && (
        <div className="text-4xl mb-6">{emoji}</div>
      )}
      
      <Typography variant="h4" color="dark" className="mb-3">
        {title}
      </Typography>
      
      <Typography variant="body" color="medium" className="mb-4">
        {description}
      </Typography>
      
      {linkText && (
        <a 
          href="#" 
          className={`font-medium transition-colors ${linkColors[gradientType]}`}
        >
          {linkText} →
        </a>
      )}
    </Card>
  );
};

export default FeatureCard;