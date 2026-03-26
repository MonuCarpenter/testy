"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle } from "lucide-react";

interface TermsModalProps {
  terms: string[];
  testTitle: string;
  onAccept: () => void;
}

export default function TermsModal({
  terms,
  testTitle,
  onAccept,
}: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          </div>
          <p className="text-green-50 text-sm">{testTitle}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-4">
              Please read and accept the following terms and conditions before
              starting the test:
            </p>
            <ol className="space-y-3">
              {terms.map((term, index) => (
                <li key={index} className="text-gray-800 leading-relaxed">
                  {term}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="accept-terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="accept-terms"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              I have read and agree to abide by the above terms and conditions.
              I understand that violation of these terms may result in test
              cancellation.
            </label>
          </div>

          <Button
            onClick={onAccept}
            disabled={!accepted}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepted ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept & Start Test
              </>
            ) : (
              "Please accept the terms to continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
