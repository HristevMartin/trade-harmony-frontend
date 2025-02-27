'use client';

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const DateSelector = ({ availableDates, selectedDate, onDateSelect }: any) => {
  return (
    <FormControl fullWidth size="small" variant="outlined" style={{ marginTop: '10px' }}>
      <InputLabel>Select Date</InputLabel>
      <Select
        style={{width: '100%'}}
        value={selectedDate}
        onChange={onDateSelect}
        label="Select Date"
      >
        {availableDates.map(date => (
          <MenuItem style={{fontWeight: 'bold'}} key={date} value={date}>
            {date}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DateSelector;
