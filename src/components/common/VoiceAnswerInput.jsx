
import { useEffect, useRef, useState } from "react";
import { Mic, Stop, GraphicEq } from "@mui/icons-material";

export default function VoiceAnswerInput({ onTranscript }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const supported = Boolean(SpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    if (!supported) {
      setError(
        "Speech recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    setError("");

    // Avoid starting multiple recognition sessions.
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setInterim("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) {
        onTranscript(finalText.trim());
      }

      setInterim(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone permission was denied. Allow microphone access.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try speaking again.");
      } else if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setError("Unable to start the microphone. Please try again.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  };

  if (!supported) {
    return (
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
        <p className="text-xs text-[var(--text-muted)]">
          Voice input is not supported in this browser. You can still type
          your answer normally. Try Chrome or Edge for voice input.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">
            Prefer speaking?
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">
            Convert your spoken answer into text.
          </p>
        </div>

        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            listening
              ? "border border-red-500/30 bg-red-500/10 text-red-400"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {listening ? (
            <>
              <Stop fontSize="small" />
              Stop recording
            </>
          ) : (
            <>
              <Mic fontSize="small" />
              Speak your answer
            </>
          )}
        </button>
      </div>

      {listening && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-400">
              Listening...
            </span>
            <GraphicEq className="ml-auto text-red-400" fontSize="small" />
          </div>

          {interim && (
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
              {interim}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <p className="text-[10px] text-[var(--text-muted)]">
        Speak naturally. You can edit the converted text in the answer box.
      </p>
    </div>
  );
}
