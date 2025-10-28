import { CheckIcon, XIcon } from 'lucide-react';
import { validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthBg } from '@/lib/password-validation';
import PropTypes from 'prop-types';

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  if (!password) return null;

  const validation = validatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Password strength</span>
          <span className={`text-sm font-medium capitalize ${getPasswordStrengthColor(validation.strength)}`}>
            {validation.strength}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBg(validation.strength)}`}
            style={{ width: `${(validation.score / validation.maxScore) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Password must contain:</p>
          <ul className="space-y-1">
            {validation.requirements.map((req) => (
              <li key={req.key} className="flex items-center space-x-2 text-xs">
                {req.passed ? (
                  <CheckIcon className="w-3 h-3 text-green-500" />
                ) : (
                  <XIcon className="w-3 h-3 text-red-500" />
                )}
                <span className={req.passed ? 'text-green-600' : 'text-gray-600'}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string.isRequired,
  showRequirements: PropTypes.bool
};

PasswordStrengthIndicator.defaultProps = {
  showRequirements: true
};

export default PasswordStrengthIndicator;