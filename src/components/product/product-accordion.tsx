import type { ReactNode } from "react";
import { PlusIcon } from "@/components/icons";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

// Native <details> disclosure: no JS, keyboard accessible, find-in-page friendly.
export function ProductAccordion({ title, defaultOpen, children }: Props) {
  return (
    <details open={defaultOpen} className="group hairline">
      <summary className="title-xs flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon
          width={16}
          height={16}
          className="transition-transform duration-500 ease-luxe group-open:rotate-45"
        />
      </summary>
      <div className="pb-6 text-soft">{children}</div>
    </details>
  );
}
