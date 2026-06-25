"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  className?: string;
  name?: string;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Contraseña",
  disabled,
  required,
  minLength,
  className,
  name,
  autoComplete,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"
        onClick={() => setShow(!show)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
