import React from 'react';
import { Calendar } from "@heroui/react";

export function StandaloneCalendar({ onSelect }) {
  return (
    <Calendar
      mode="single"
      onSelect={onSelect}
      className="rounded-lg"
      showOutsideDays={false}
      fixedWeeks
      initialFocus
    />
  );
}