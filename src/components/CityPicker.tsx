import React, { useState, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash.debounce';
import { MapPin, Search } from 'lucide-react';

interface CityOption {
  label: string;
  value: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface CityPickerProps {
  onSelect: (lat: number, lng: number, cityName: string) => void;
  colorTheme?: 'gold' | 'red';
  initialValue?: string | null;
}

export default function CityPicker({ onSelect, colorTheme, initialValue }: CityPickerProps) {
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(initialValue ? { label: initialValue, value: { lat: 0, lng: 0, name: initialValue } } : null);

  const searchOpenMeteo = async (inputValue: string) => {
    if (!inputValue || inputValue.length < 2) return [];

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputValue)}&language=ru&count=10`);
      if (!res.ok) throw new Error('Geocoding API failed');
      const data = await res.json();
      const results = data.results || [];

      return results.map((item: any) => {
        const labelParts = [item.name];
        if (item.admin1 && item.admin1 !== item.name) labelParts.push(item.admin1);
        if (item.country) labelParts.push(item.country);
        
        return {
          label: labelParts.join(', '),
          value: {
            lat: item.latitude,
            lng: item.longitude,
            name: labelParts.join(', ')
          }
        };
      });
    } catch (err) {
      console.error('City search provider failed:', err);
      return [];
    }
  };

  const debouncedSearch = useCallback(
    debounce((inputValue: string, callback: (options: CityOption[]) => void) => {
      searchOpenMeteo(inputValue).then(callback);
    }, 500),
    []
  );

  const loadOptions = (inputValue: string, callback: (options: CityOption[]) => void) => {
    debouncedSearch(inputValue, callback);
  };

  const isRed = colorTheme === 'red';
  const primaryColor = isRed ? '#ef4444' : '#d4af37';
  const primaryColorRgba = isRed ? '239, 68, 68' : '212, 175, 55';

  return (
    <div className="relative group text-[15px] md:text-base font-light font-sans">
      <div className={`absolute left-0 top-[40%] -translate-y-1/2 z-10 text-gray-400 opacity-50 ${isRed ? 'group-focus-within:text-red-500 group-focus-within:opacity-100' : 'group-focus-within:text-gold group-focus-within:opacity-100'} transition-all`}>
        <MapPin size={18} />
      </div>
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        value={selectedCity}
        getOptionValue={(option: any) => `${option.value.lat}-${option.value.lng}`}
        placeholder="Город рождения..."
        noOptionsMessage={({ inputValue }) => !inputValue ? "Начните вводить название..." : "Город не найден"}
        loadingMessage={() => "Поиск..."}
        onChange={(option: any) => {
          setSelectedCity(option);
          if (option) {
            onSelect(option.value.lat, option.value.lng, option.value.name);
          }
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: state.isFocused ? `1px solid rgba(${primaryColorRgba}, 0.5)` : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0',
            padding: '0.4rem 0 0.8rem 2rem',
            minHeight: '48px',
            color: 'white',
            boxShadow: 'none',
            transition: 'all 0.3s ease',
            cursor: 'text',
            '&:hover': {
              borderBottomColor: `rgba(${primaryColorRgba}, 0.3)`,
            }
          }),
          valueContainer: (base) => ({
            ...base,
            padding: '0',
          }),
          input: (base) => ({
            ...base,
            color: 'white',
            margin: '0',
            paddingTop: '0',
            paddingBottom: '0',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 300,
          }),
          singleValue: (base) => ({
            ...base,
            color: 'white',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 300,
          }),
          menu: (base) => ({
            ...base,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            backdropBlur: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            zIndex: 50,
            marginTop: '8px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? `rgba(${primaryColorRgba}, 0.1)` : 'transparent',
            color: state.isFocused ? primaryColor : 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: '0.8rem 1.2rem',
            fontSize: '14px',
            fontWeight: 300,
            '&:active': {
              backgroundColor: `rgba(${primaryColorRgba}, 0.2)`,
            }
          }),
          placeholder: (base) => ({
            ...base,
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: 'inherit',
            fontWeight: 300,
          })
        }}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
      />
    </div>
  );
}
