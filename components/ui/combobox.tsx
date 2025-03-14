"use strict";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "cmdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  emptyMessage?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isSelected?: (option: string) => boolean | undefined;
  onBlur?: () => void;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  emptyMessage = "No results found.",
  onKeyDown,
  isSelected,
  onBlur,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes((inputValue || "").toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mb-2 border-pink-200 hover:bg-pink-50 focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-pink-200 rounded-md shadow-lg mt-1">
        <Command className="border-none">
          <div className="sticky top-0 bg-white z-10 border-b border-pink-200">
            <CommandInput
              placeholder={placeholder}
              value={inputValue || ""}
              onValueChange={(newValue) => {
                setInputValue(newValue);
                onChange(newValue);
              }}
              onBlur={() => {
                if (!open && value) {
                  onBlur?.();
                  setInputValue(value);
                }
              }}
              className="w-full px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="p-2 text-sm text-gray-500">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-pink-50 cursor-pointer flex items-center"
                >
                  <Check
                    className={cn(
                      "mr-3 h-4 w-4 text-pink-600",
                      isSelected?.(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
