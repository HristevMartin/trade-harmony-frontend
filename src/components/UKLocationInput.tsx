import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HiShieldCheck } from "react-icons/hi2";

interface LocationData {
  country: string;
  location: string;
  postcode: string;
}

interface UKLocationInputProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
  errors?: {
    location?: string;
    postcode?: string;
  };
}

const UKLocationInput: React.FC<UKLocationInputProps> = ({ value, onChange, errors = {} }) => {
  const [postcodeError, setPostcodeError] = useState('');
  const [locationError, setLocationError] = useState('');

  // UK postcode validation regex - matches formats like SW1A 1AA, M1 1AA, B33 8TH
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;

  const validatePostcode = (postcode: string) => {
    if (!postcode.trim()) {
      return 'Postcode is required';
    }
    if (!ukPostcodeRegex.test(postcode.trim())) {
      return 'Please enter a valid UK postcode (e.g., SW1A 1AA)';
    }
    return '';
  };

  const validateLocation = (location: string) => {
    if (!location.trim()) {
      return 'Location is required';
    }
    return '';
  };

  const handleLocationChange = (newLocation: string) => {
    onChange({
      ...value,
      location: newLocation
    });
  };

  const handleLocationBlur = () => {
    const error = validateLocation(value.location);
    setLocationError(error);
  };

  const handlePostcodeChange = (newPostcode: string) => {
    // Auto-uppercase the postcode
    const uppercasePostcode = newPostcode.toUpperCase();
    
    onChange({
      ...value,
      postcode: uppercasePostcode
    });
  };

  const handlePostcodeBlur = () => {
    const error = validatePostcode(value.postcode);
    setPostcodeError(error);
  };

  // Use external errors if provided, otherwise use internal state
  const displayLocationError = errors.location || locationError;
  const displayPostcodeError = errors.postcode || postcodeError;

  return (
    <div className="space-y-4">
      {/* Location Input */}
      <div>
        <Label htmlFor="uk-location" className="text-sm font-medium text-slate-700">
          Town/City <span className="text-red-500">*</span>
        </Label>
        <Input
          id="uk-location"
          value={value.location}
          onChange={(e) => handleLocationChange(e.target.value)}
          onBlur={handleLocationBlur}
          placeholder="e.g., London, Manchester, Birmingham"
          className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
            displayLocationError ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
          }`}
          aria-invalid={!!displayLocationError}
          aria-describedby={displayLocationError ? 'location-error' : 'location-help'}
        />
        {displayLocationError ? (
          <p id="location-error" className="text-xs text-red-600 mt-1">{displayLocationError}</p>
        ) : (
          <p id="location-help" className="text-xs text-slate-500 mt-1">Enter your town or city</p>
        )}
      </div>

      {/* Postcode Input */}
      <div>
        <Label htmlFor="uk-postcode" className="text-sm font-medium text-slate-700">
          Postcode <span className="text-red-500">*</span>
        </Label>
        <Input
          id="uk-postcode"
          value={value.postcode}
          onChange={(e) => handlePostcodeChange(e.target.value)}
          onBlur={handlePostcodeBlur}
          placeholder="e.g., SW1A 1AA"
          className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
            displayPostcodeError ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
          }`}
          aria-invalid={!!displayPostcodeError}
          aria-describedby={displayPostcodeError ? 'postcode-error' : 'postcode-help'}
        />
        {displayPostcodeError ? (
          <p id="postcode-error" className="text-xs text-red-600 mt-1">{displayPostcodeError}</p>
        ) : (
          <p id="postcode-help" className="text-xs text-slate-500 mt-1">Enter your full UK postcode</p>
        )}
      </div>

      {/* Privacy Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <HiShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-blue-800">
          <strong>Privacy:</strong> Traders will see your location and postcode to find local work opportunities. 
          This helps us connect you with nearby professionals.
        </p>
      </div>
    </div>
  );
};

export default UKLocationInput;
