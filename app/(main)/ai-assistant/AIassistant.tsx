"use client";
import { PromptComposer } from "./components/prompt-composer";
import { WelcomeHeading } from "./components/WelcomeHeading";
export default function AIAssistant() {
  return (
    <>
      <div className=" flex  flex-col items-center m-auto justify-center flex-1 w-full gap-5">
        <WelcomeHeading />
        <PromptComposer />
      </div>
    </>
  );
}
