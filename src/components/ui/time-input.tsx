
import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimeInput({ value, onChange, placeholder = "Selecionar horário", className }: TimeInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hours, setHours] = React.useState("");
  const [minutes, setMinutes] = React.useState("");

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHours(h || "");
      setMinutes(m || "");
    } else {
      setHours("");
      setMinutes("");
    }
  }, [value]);

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    if (newHours && newMinutes) {
      const timeValue = `${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`;
      onChange?.(timeValue);
    } else if (!newHours && !newMinutes) {
      onChange?.("");
    }
  };

  const handleHoursChange = (newHours: string) => {
    setHours(newHours);
    handleTimeChange(newHours, minutes);
  };

  const handleMinutesChange = (newMinutes: string) => {
    setMinutes(newMinutes);
    handleTimeChange(hours, newMinutes);
  };

  const generateOptions = (max: number, step = 1) => {
    const options = [];
    for (let i = 0; i < max; i += step) {
      options.push(i.toString().padStart(2, '0'));
    }
    return options;
  };

  const hourOptions = generateOptions(24);
  const minuteOptions = generateOptions(60, 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="text-sm font-medium text-center">Selecionar Horário</div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <label className="text-xs text-muted-foreground mb-1">Hora</label>
              <select
                value={hours}
                onChange={(e) => handleHoursChange(e.target.value)}
                className="w-16 h-10 text-center border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">--</option>
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xl font-bold pt-6">:</div>
            <div className="flex flex-col items-center">
              <label className="text-xs text-muted-foreground mb-1">Minuto</label>
              <select
                value={minutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="w-16 h-10 text-center border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">--</option>
                {minuteOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHours("");
                setMinutes("");
                onChange?.("");
                setIsOpen(false);
              }}
            >
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={!hours || !minutes}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
