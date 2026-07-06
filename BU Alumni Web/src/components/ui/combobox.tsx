'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ComboboxProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search or type...',
  emptyMessage = 'No option found.',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedOption = options.find((option) => option.value === value);

  // Allow free-form typing: if input doesn't match any option, treat it as a custom value
  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? '' : currentValue;
    onChange(newValue);
    setInputValue('');
    setOpen(false);
  };

  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
    // Update value immediately as user types for free-form input
    onChange(newInputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      onChange(inputValue);
      setOpen(false);
      setInputValue('');
    }
  };

  const filteredOptions = inputValue
    ? options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : options;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between bg-input border-input focus:border-primary focus:ring-primary/20 transition-all font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selectedOption ? selectedOption.label : value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-muted-foreground">No exact match</span>
                  <span className="text-xs text-muted-foreground">Press Enter to use "{inputValue}"</span>
                </div>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
