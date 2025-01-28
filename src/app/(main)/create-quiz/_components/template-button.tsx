'use client'

import { Button } from "@/components/ui/button"

const QUESTIONS_TEMPLATE = {
  "questions": [
    {
      "question": "Care este capitala României?",
      "song": "",
      "image": "",
      "video": "",
      "correct_answer": "București",
      "incorrect_answers": [
        "Cluj",
        "Iași",
        "Timișoara"
      ]
    },
    {
      "question": "Care este cel mai înalt vârf din România?",
      "song": "",
      "image": "",
      "video": "",
      "correct_answer": "Moldoveanu",
      "incorrect_answers": [
        "Omu",
        "Negoiu",
        "Parângul Mare"
      ]
    }
  ]
};

export default function TemplateButton() {
  return (
    <Button 
      type="button" 
      variant="outline"
      onClick={() => {
        const textarea = document.getElementById('questions') as HTMLTextAreaElement;
        textarea.value = JSON.stringify(QUESTIONS_TEMPLATE, null, 2);
      }}
    >
      Inserează Template
    </Button>
  );
} 