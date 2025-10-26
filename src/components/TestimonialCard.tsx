import React from 'react';
import Card from './ui/Card';
import Typography from './ui/Typography';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  initial: string;
  gradientType: 'primary' | 'success' | 'warning' | 'accent';
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  quote, 
  author, 
  role, 
  initial,
  gradientType 
}) => {
  const avatarColors = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-orange-600',
    accent: 'bg-purple-600'
  };

  return (
    <Card variant="feature" gradientType={gradientType}>
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      
      <Typography variant="body" color="dark" className="mb-6 leading-relaxed">
        "{quote}"
      </Typography>
      
      <div className="flex items-center">
        <div className={`w-10 h-10 ${avatarColors[gradientType]} rounded-full flex items-center justify-center text-white font-semibold`}>
          {initial}
        </div>
        <div className="ml-3">
          <Typography variant="body" color="dark" className="font-semibold">
            {author}
          </Typography>
          <Typography variant="caption" color="medium">
            {role}
          </Typography>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;