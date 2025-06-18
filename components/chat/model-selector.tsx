'use client';

import { MODELS } from '@/lib/models';
import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Model = {
  id: string;
  name: string;
  company: string;
  supports: string[];
};

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = item[key] as string;
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = MODELS.find((m) => m.id === value);
  const [open, setOpen] = useState(false);
  const groupedModels = groupBy(MODELS, 'company');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="capitalize w-64 justify-start">
          {selected?.name ?? 'Select a model'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select a Model</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] mt-4 pr-2">
          <div className="space-y-6">
            {Object.entries(groupedModels).map(([company, models]) => (
              <div key={company}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{company}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <DialogClose asChild key={model.id}>
                      <button
                        onClick={() => onChange(model.id)}
                        className={cn(
                          'border rounded-lg p-4 text-left w-full h-full flex flex-col justify-between transition-colors hover:bg-muted',
                          value === model.id && 'border-blue-500 bg-muted'
                        )}
                      >
                        <div>
                          <div className="font-semibold text-base">{model.name}</div>
                        </div>
                        {model.supports.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-3">
                            {model.supports.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-[10px] font-normal px-1.5 py-0.5"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </button>
                    </DialogClose>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
