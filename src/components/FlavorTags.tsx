import { FlavorNote } from "@/lib/coffee-data";

interface FlavorTagsProps {
  flavorNotes: FlavorNote[];
}

export const FlavorTags = ({ flavorNotes = [] }: FlavorTagsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {flavorNotes?.map((note) => (
        <span
          key={note}
          className="px-3 py-1 bg-background rounded-full text-sm"
        >
          {note}
        </span>
      ))}
    </div>
  );
};