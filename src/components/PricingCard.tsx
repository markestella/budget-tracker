'use client';

import React from 'react';
import Link from 'next/link';
import Card from './ui/Card';
import Typography from './ui/Typography';
import Button from './ui/Button';
import { useTheme } from './ThemeProvider';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  buttonLink?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { isDark } = useTheme();
  
  return (
    <Card 
      variant="white" 
      className={`p-8 relative ${
        plan.popular 
          ? `border-2 ${isDark ? 'border-blue-400' : 'border-blue-300'}` 
          : `border-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="!bg-blue-600 !text-white px-4 py-2 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="mb-6">
        <Typography variant="h3" color="dark" className="mb-2">
          {plan.name}
        </Typography>
        <div className="flex items-baseline">
          <Typography variant="h1" color="dark" className="text-4xl">
            {plan.price}
          </Typography>
          <Typography variant="body" color="light" className="ml-1">
            {plan.period}
          </Typography>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <Typography variant="body" color="dark">
              {feature}
            </Typography>
          </li>
        ))}
      </ul>

      {plan.buttonLink ? (
        <Link href={plan.buttonLink}>
          <Button 
            variant={plan.buttonVariant || 'primary'} 
            size="lg" 
            className="w-full"
          >
            {plan.buttonText}
          </Button>
        </Link>
      ) : (
        <Button 
          variant={plan.buttonVariant || 'primary'} 
          size="lg" 
          className="w-full"
        >
          {plan.buttonText}
        </Button>
      )}
    </Card>
  );
};

export default PricingCard;