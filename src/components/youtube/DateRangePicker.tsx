
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Último ano', days: 365 },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date }>({
    from: value.from,
    to: value.to,
  });

  const handlePresetSelect = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    const newRange = { from, to };
    setSelectedRange(newRange);
    onChange(newRange);
    setIsOpen(false);
  };

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    setSelectedRange(range);
    
    if (range.from && range.to) {
      onChange({ from: range.from, to: range.to });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd/MM/yyyy")} -{" "}
                {format(value.to, "dd/MM/yyyy")}
              </>
            ) : (
              format(value.from, "dd/MM/yyyy")
            )
          ) : (
            <span>Selecione o período</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col gap-2 p-3 border-r">
            <div className="text-sm font-medium">Períodos predefinidos</div>
            {presets.map((preset) => (
              <Button
                key={preset.days}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetSelect(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={selectedRange.from && selectedRange.to ? selectedRange : undefined}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
