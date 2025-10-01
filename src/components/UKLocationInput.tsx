import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Major UK cities and towns
const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 
  'Sheffield', 'Bristol', 'Edinburgh', 'Leicester', 'Nottingham', 'Coventry', 
  'Bradford', 'Cardiff', 'Belfast', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth', 
  'Southampton', 'Reading', 'Derby', 'Dudley', 'Northampton', 'Portsmouth', 
  'Luton', 'Preston', 'Aberdeen', 'Milton Keynes', 'Sunderland', 'Norwich', 
  'Ipswich', 'Swansea', 'Croydon', 'Bournemouth', 'Peterborough', 'Brighton', 
  'Hull', 'Middlesbrough', 'Swindon', 'Huddersfield', 'Oxford', 'Cambridge', 
  'York', 'Gloucester', 'Exeter', 'Bath', 'Blackpool', 'Chester', 
  'Doncaster', 'Dunfermline', 'Inverness', 'Paisley', 'Poole', 'Slough', 
  'Southend-on-Sea', 'Telford', 'Warrington', 'Watford', 'Wigan', 'Worcester'
];

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
      {/* Location Dropdown */}
      <div>
        <Label htmlFor="uk-location" className="text-sm font-medium text-slate-700">
          Town/City <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={value.location} 
          onValueChange={(newLocation) => {
            handleLocationChange(newLocation);
            // Clear any existing location errors when a city is selected
            setLocationError('');
          }}
        >
          <SelectTrigger 
            id="uk-location"
            className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
              displayLocationError ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
            }`}
            aria-invalid={!!displayLocationError}
            aria-describedby={displayLocationError ? 'location-error' : 'location-help'}
          >
            <SelectValue placeholder="Select your town/city" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {UK_CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {displayLocationError ? (
          <p id="location-error" className="text-xs text-red-600 mt-1">{displayLocationError}</p>
        ) : (
          <p id="location-help" className="text-xs text-slate-500 mt-1">Select your town or city</p>
        )}
      </div>

      {/* Postcode Input - Always show for all UK cities */}
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
