import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="text-sm text-gray-600 flex items-center space-x-1 mb-4">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          )}
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};
