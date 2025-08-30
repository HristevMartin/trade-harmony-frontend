import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HiShieldCheck } from "react-icons/hi2";

interface LocationData {
  country: string;
  postcode: string;
  area: string;
}

interface UKLocationInputProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
  errors?: {
    postcode?: string;
    area?: string;
  };
}

const UKLocationInput: React.FC<UKLocationInputProps> = ({ value, onChange, errors = {} }) => {
  const [postcodeError, setPostcodeError] = useState('');
  const [areaError, setAreaError] = useState('');

  // UK postcode validation regex - matches formats like SW1A 1AA, M1 1AA, B33 8TH
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;

  // Common UK areas/neighborhoods for the dropdown
  const ukAreas = [
    'City Centre', 'Town Centre', 'Old Town', 'New Town',
    'North', 'South', 'East', 'West',
    'Central', 'Downtown', 'Suburb',
    'Village', 'Industrial Estate', 'Business Park',
    'Residential Area', 'Historic Quarter'
  ];

  const validatePostcode = (postcode: string) => {
    if (!postcode.trim()) {
      return 'Postcode is required';
    }
    if (!ukPostcodeRegex.test(postcode.trim())) {
      return 'Please enter a valid UK postcode (e.g., SW1A 1AA)';
    }
    return '';
  };

  const validateArea = (area: string) => {
    if (!area.trim()) {
      return 'Area is required';
    }
    return '';
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

  const handleAreaChange = (newArea: string) => {
    onChange({
      ...value,
      area: newArea
    });
  };

  const handleAreaBlur = () => {
    const error = validateArea(value.area);
    setAreaError(error);
  };

  // Use external errors if provided, otherwise use internal state
  const displayPostcodeError = errors.postcode || postcodeError;
  const displayAreaError = errors.area || areaError;

  return (
    <div className="space-y-4">
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

      {/* Area Input */}
      <div>
        <Label htmlFor="uk-area" className="text-sm font-medium text-slate-700">
          Area/Neighborhood <span className="text-red-500">*</span>
        </Label>
        <Select value={value.area} onValueChange={handleAreaChange}>
          <SelectTrigger 
            id="uk-area"
            className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
              displayAreaError ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
            }`}
            aria-invalid={!!displayAreaError}
            aria-describedby={displayAreaError ? 'area-error' : 'area-help'}
          >
            <SelectValue placeholder="Select your area" />
          </SelectTrigger>
          <SelectContent>
            {ukAreas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
            <SelectItem value="other">Other (please specify in job description)</SelectItem>
          </SelectContent>
        </Select>
        {displayAreaError ? (
          <p id="area-error" className="text-xs text-red-600 mt-1">{displayAreaError}</p>
        ) : (
          <p id="area-help" className="text-xs text-slate-500 mt-1">Select the area where you need the work done</p>
        )}
      </div>

      {/* Privacy Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <HiShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-blue-800">
          <strong>Privacy:</strong> Traders will only see your area, not your exact postcode. 
          Your postcode helps us find local professionals.
        </p>
      </div>
    </div>
  );
};

export default UKLocationInput;
