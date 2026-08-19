"use client";
import { PromptSuggestions } from "./components/prompt-suggestions";
import { PromptComposer } from "./components/prompt-composer";

const suggestions = [
  { id: "1", label: "Summarize this thread", hint: "Condense into 3 bullets" },
  { id: "2", label: "Draft a reply", hint: "Friendly and concise" },
  { id: "3", label: "Find action items", hint: "Extract todos and owners" },
];

export default function AIAssistant() {
  return (
    <>
      <div className=" flex  flex-col items-center m-auto justify-center flex-1 w-full gap-5">
        <PromptSuggestions
          suggestions={suggestions}
          onSelect={(s) => console.log(s.label)}
        />

        <PromptComposer
        />
      </div>
    </>
  );
}
