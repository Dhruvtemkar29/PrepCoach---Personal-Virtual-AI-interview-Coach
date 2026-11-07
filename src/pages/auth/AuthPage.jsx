import {
    useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
} from "react";
import { Link } from "react-router-dom";
import {
    AnimatePresence, MotionConfig, animate, motion, useAnimationControls,
    useMotionValue, useReducedMotion, useSpring,
} from "motion/react";
import {
    ArrowBack, ArrowForward, AutoAwesome, Close, DarkMode, LightMode,
    Refresh, Visibility, VisibilityOff,
} from "@mui/icons-material";
import * as ThemeModule from "../../context/ThemeContext";

import "./AuthPage.css";

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEMO_OTP = "246810"; // demonstration code only, nothing is emailed
const RESEND_SECONDS = 30;
const STEPS = 20; // dial resolution
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const isDarkAt = (v) => Math.round(clamp(v, 0, 1) * STEPS) < STEPS / 2;

const TIPS = [
    "Answer the question you were asked, then stop talking.",
    "Lead with the result. The story can follow.",
    "A short pause before you answer reads as confidence.",
    "Practice out loud. Your voice needs the reps too.",
];

const STRENGTH = [
    { label: "", color: "transparent" },
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#84cc16" },
    { label: "Strong", color: "#22c55e" },
];

function scorePassword(pw) {
    if (!pw) return 0;
    if (pw.length < 8) return 1;
    const variety =
        (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) +
        (/\d/.test(pw) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
    return Math.min(4, 1 + variety + (pw.length >= 12 ? 1 : 0));
}

function passwordError(pw) {
    if (pw.length < 8) return "Use at least 8 characters";
    if (scorePassword(pw) < 3) return "Add capitals, numbers or symbols";
    return "";
}

function lightName(step) {
    if (step <= 3) return "Blackout";
    if (step < 10) return "Dimming";
    if (step < 17) return "Warming up";
    return "Daylight";
}

/* Works with the common ThemeContext shapes: { isDark | darkMode | theme | mode, toggleTheme | setTheme } */
const useThemeCompat =
    ThemeModule.useTheme ??
    (ThemeModule.ThemeContext
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ? () => useContext(ThemeModule.ThemeContext)
        : () => null);

function readIsDark(ctx) {
    if (!ctx) return undefined;
    if (typeof ctx.isDark === "boolean") return ctx.isDark;
    if (typeof ctx.darkMode === "boolean") return ctx.darkMode;
    const name = ctx.theme ?? ctx.mode;
    return typeof name === "string" ? name === "dark" : undefined;
}

const domIsDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") !== "light";

function useInert(ref, inert) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (inert) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
    }, [ref, inert]);
}

const ITEM = {
    off: { opacity: 0, y: 10 },
    on: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] } },
};
const paneVariants = (side) => ({
    off: { opacity: 0, x: side * 28, transition: { duration: 0.2 } },
    on: { opacity: 1, x: 0, transition: { duration: 0.3, staggerChildren: 0.05, delayChildren: 0.1 } },
});
const LOGIN_V = paneVariants(-1);
const SIGNUP_V = paneVariants(1);

/* ------------------------------------------------------------------ */
/*  Shared bits (same patterns as the landing page)                    */
/* ------------------------------------------------------------------ */

function Brand() {
    return (
        <Link to="/" className="pc-brand flex shrink-0 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ff2e2e] to-[#991b1b] text-white shadow-lg shadow-red-900/25">
                <AutoAwesome />
            </span>
            <span className="flex flex-col leading-tight">
                <strong className="font-sora text-xl font-extrabold tracking-tight">
                    Prep<span className="text-[#ff2e2e]">Coach</span>
                </strong>
                <small className="font-mono text-[9px] tracking-[.19em] text-[var(--text-muted)]">
                    AI INTERVIEW PARTNER
                </small>
            </span>
        </Link>
    );
}

function SectionLabel({ children }) {
    return (
        <span className="font-mono text-[11px] font-medium tracking-[.25em] text-[#ff5555]">
            {children}
        </span>
    );
}

function Field({ id, label, error, aside, asideColor, children }) {
    return (
        <motion.div className="pc-field" variants={ITEM}>
            <div className="pc-field__top">
                <label htmlFor={id}>{label}</label>
                <span
                    id={`${id}-msg`}
                    className={error ? "pc-field__err" : "pc-field__aside"}
                    style={!error && asideColor ? { color: asideColor } : undefined}
                    aria-live="polite"
                >
                    {error || aside}
                </span>
            </div>
            {children}
        </motion.div>
    );
}

function TextField({ id, label, error, ...input }) {
    return (
        <Field id={id} label={label} error={error}>
            <div className="pc-input">
                <input id={id} aria-invalid={!!error} aria-describedby={`${id}-msg`} {...input} />
            </div>
        </Field>
    );
}

function PasswordField({ id, label, value, onChange, onBlur, error, autoComplete, score, autoFocusMark }) {
    const [show, setShow] = useState(false);
    const s = STRENGTH[score || 0];
    return (
        <Field id={id} label={label} error={error} aside={score ? s.label : ""} asideColor={s.color}>
            <div className="pc-input">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    autoComplete={autoComplete}
                    spellCheck={false}
                    autoCapitalize="none"
                    aria-invalid={!!error}
                    aria-describedby={`${id}-msg`}
                    data-autofocus={autoFocusMark ? "" : undefined}
                />
                <button
                    type="button"
                    className="pc-eye"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                >
                    {show ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                </button>
                {score !== undefined && (
                    <span className="pc-meter" style={{ "--m": s.color }} aria-hidden="true">
                        {[1, 2, 3, 4].map((i) => <i key={i} className={i <= score ? "on" : ""} />)}
                    </span>
                )}
            </div>
        </Field>
    );
}

function SubmitButton({ busy, children }) {
    return (
        <button type="submit" className="pc-btn group" disabled={busy}>
            {busy ? (
                <><Refresh sx={{ fontSize: 17 }} className="pc-spin" /> CHECKING</>
            ) : (
                <>{children}<ArrowForward sx={{ fontSize: 17 }} className="transition-transform group-hover:translate-x-1" /></>
            )}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  The signature: a physical house-lights dial                        */
/* ------------------------------------------------------------------ */

function Dial({ mv, step, goTo }) {
    const knobRef = useRef(null);
    const drag = useRef(null);

    useLayoutEffect(() => {
        const paint = (v) => {
            if (knobRef.current) knobRef.current.style.transform = `rotate(${-135 + v * 270}deg)`;
        };
        paint(mv.get());
        return mv.on("change", paint);
    }, [mv]);

    const angleOf = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        return (Math.atan2(dx, -dy) * 180) / Math.PI;
    };

    const down = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        mv.stop();
        drag.current = { a: angleOf(e), v: clamp(mv.get(), 0, 1), x: e.clientX, y: e.clientY, moved: 0 };
    };

    const move = (e) => {
        const d = drag.current;
        if (!d) return;
        let da = angleOf(e) - d.a;
        if (da > 180) da -= 360;
        if (da < -180) da += 360;
        d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x, e.clientY - d.y));
        const v = clamp(d.v + da / 270, 0, 1);
        mv.set(v);
        if (v === 0 || v === 1) { d.a = angleOf(e); d.v = v; } // re-baseline at the end stops
    };

    const up = () => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        const v = mv.get();
        // A tap flips the room; a turn snaps to the nearest detent.
        goTo(d.moved < 5 ? (v > 0.5 ? 0 : 1) : v > 0.5 ? 1 : 0);
    };

    const key = (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(mv.get() > 0.5 ? 0 : 1); }
        else if (["ArrowLeft", "ArrowDown", "Home"].includes(e.key)) { e.preventDefault(); goTo(0); }
        else if (["ArrowRight", "ArrowUp", "End"].includes(e.key)) { e.preventDefault(); goTo(1); }
    };

    return (
        <div className="pc-console glass">
            <div
                className="pc-dial"
                role="switch"
                tabIndex={0}
                aria-checked={step >= STEPS / 2}
                aria-label="Daylight"
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onKeyDown={key}
            >
                <div className="pc-dial__ticks" aria-hidden="true">
                    {Array.from({ length: STEPS + 1 }, (_, i) => (
                        <i key={i} className={step > 0 && i <= step ? "is-lit" : ""} style={{ "--r": `${-135 + i * 13.5}deg` }} />
                    ))}
                </div>
                <div className="pc-knob" ref={knobRef} aria-hidden="true"><span /></div>
            </div>

            <div className="pc-console__meta">
                <p className="pc-onair"><i className="pc-led" />HOUSE LIGHTS</p>
                <output className="pc-readout font-sora">{lightName(step)}</output>
                <p className="pc-hint">Turn the dial, tap it, or press Space.</p>
                <div className="pc-console__btns">
                    <button type="button" onClick={() => goTo(0)}><DarkMode sx={{ fontSize: 15 }} /> Dark</button>
                    <button type="button" onClick={() => goTo(1)}><LightMode sx={{ fontSize: 15 }} /> Light</button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Password recovery: a four-stage dialog                             */
/* ------------------------------------------------------------------ */

function RecoveryBooth({ initialEmail, onClose, onDone }) {
    const uid = useId();
    const dialogRef = useRef(null);
    const otpRefs = useRef([]);
    const shakeControls = useAnimationControls();

    const [stage, setStage] = useState(0);
    const [email, setEmail] = useState(initialEmail || "");
    const [emailErr, setEmailErr] = useState("");
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [otpErr, setOtpErr] = useState("");
    const [cool, setCool] = useState(0);
    const [reissued, setReissued] = useState(false);
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [tried, setTried] = useState(false);

    /* Focus management, scroll lock, Escape, and a simple focus trap */
    useEffect(() => {
        const prev = document.activeElement;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
            if (e.key !== "Tab" || !dialogRef.current) return;
            const nodes = [...dialogRef.current.querySelectorAll("button:not([disabled]), input:not([disabled])")];
            if (!nodes.length) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
            prev?.focus?.();
        };
    }, [onClose]);

    /* Focus the first field of each stage once its transition settles */
    useEffect(() => {
        const id = setTimeout(() => dialogRef.current?.querySelector("[data-autofocus]")?.focus(), 320);
        return () => clearTimeout(id);
    }, [stage]);

    /* Resend countdown */
    useEffect(() => {
        if (cool <= 0) return undefined;
        const id = setTimeout(() => setCool((c) => c - 1), 1000);
        return () => clearTimeout(id);
    }, [cool]);

    const sendCode = (e) => {
        e.preventDefault();
        if (!EMAIL_RE.test(email.trim())) { setEmailErr("Enter a valid email address"); return; }
        setEmailErr("");
        setOtp(Array(6).fill(""));
        setOtpErr("");
        setReissued(false);
        setCool(RESEND_SECONDS);
        setStage(1);
    };

    const setDigit = (i, raw) => {
        const digits = raw.replace(/\D/g, "");
        setOtpErr("");
        if (!digits) { setOtp((o) => o.map((x, k) => (k === i ? "" : x))); return; }
        setOtp((o) => {
            const n = [...o];
            digits.slice(0, 6 - i).split("").forEach((c, k) => { n[i + k] = c; });
            return n;
        });
        otpRefs.current[Math.min(i + digits.length, 5)]?.focus();
    };

    const otpKey = (e, i) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            e.preventDefault();
            setOtp((o) => o.map((x, k) => (k === i - 1 ? "" : x)));
            otpRefs.current[i - 1]?.focus();
        } else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); otpRefs.current[i - 1]?.focus(); }
        else if (e.key === "ArrowRight" && i < 5) { e.preventDefault(); otpRefs.current[i + 1]?.focus(); }
    };

    const otpPaste = (e) => {
        const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
        if (!d) return;
        e.preventDefault();
        setOtp(Array.from({ length: 6 }, (_, k) => d[k] || ""));
        setOtpErr("");
        otpRefs.current[Math.min(d.length, 5)]?.focus();
    };

    const verify = (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) { setOtpErr("Enter all six digits"); return; }
        if (code !== DEMO_OTP) {
            setOtpErr("That code doesn’t match the demo code.");
            shakeControls.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.4 } });
            return;
        }
        setOtpErr("");
        setStage(2);
    };

    const resend = () => {
        if (cool > 0) return;
        setOtp(Array(6).fill(""));
        setOtpErr("");
        setReissued(true);
        setCool(RESEND_SECONDS);
        otpRefs.current[0]?.focus();
    };

    const pwErr = tried ? passwordError(pw) : "";
    const pw2Err = tried ? (!pw2 ? "Confirm your password" : pw2 !== pw ? "Passwords don’t match" : "") : "";

    const savePw = (e) => {
        e.preventDefault();
        setTried(true);
        if (passwordError(pw) || pw2 !== pw) return;
        setStage(3);
    };

    const tid = `${uid}-title`;

    return (
        <motion.div
            className="pc-booth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                ref={dialogRef}
                className="pc-ticket"
                role="dialog"
                aria-modal="true"
                aria-labelledby={tid}
                initial={{ opacity: 0, y: 36, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            >
                <header className="pc-ticket__head">
                    <div className="pc-cues" aria-hidden="true">
                        {[0, 1, 2, 3].map((i) => <i key={i} className={i <= stage ? "is-on" : ""} />)}
                    </div>
                    <span className="pc-ticket__step">PASSWORD RECOVERY · STEP {stage + 1} OF 4</span>
                    <button type="button" className="pc-x" onClick={onClose} aria-label="Close password recovery">
                        <Close sx={{ fontSize: 19 }} />
                    </button>
                </header>

                <div className="pc-ticket__body">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={stage}
                            className="pc-stagebox"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.22 }}
                        >
                            {stage === 0 && (
                                <form onSubmit={sendCode} noValidate className="pc-stageform">
                                    <h2 id={tid} className="pc-booth__title font-sora">Find your account</h2>
                                    <p className="pc-booth__sub">Enter your registered email. In this demo the code appears on screen; nothing is emailed.</p>
                                    <TextField
                                        id={`${uid}-email`} label="REGISTERED EMAIL" type="email" inputMode="email"
                                        autoComplete="email" value={email} error={emailErr} data-autofocus=""
                                        onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                                    />
                                    <SubmitButton>GET DEMO CODE</SubmitButton>
                                </form>
                            )}

                            {stage === 1 && (
                                <form onSubmit={verify} noValidate className="pc-stageform">
                                    <h2 id={tid} className="pc-booth__title font-sora">Enter the 6-digit code</h2>
                                    <p className="pc-booth__sub">Verification for {email.trim()}</p>
                                    <p className="pc-chip"><b>DEMO CODE</b><span>{DEMO_OTP}</span><em>No email was sent</em></p>
                                    <motion.div className="pc-otp" role="group" aria-label="Six digit code" animate={shakeControls} onPaste={otpPaste}>
                                        {otp.map((d, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                className={`pc-otp__d${d ? " is-filled" : ""}`}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={6}
                                                autoComplete={i === 0 ? "one-time-code" : "off"}
                                                aria-label={`Digit ${i + 1}`}
                                                aria-invalid={!!otpErr}
                                                value={d}
                                                onChange={(e) => setDigit(i, e.target.value)}
                                                onKeyDown={(e) => otpKey(e, i)}
                                                onFocus={(e) => e.target.select()}
                                                data-autofocus={i === 0 ? "" : undefined}
                                            />
                                        ))}
                                    </motion.div>
                                    <p className="pc-booth__msg" role="alert">{otpErr || (reissued ? `Demo code issued again. It is still ${DEMO_OTP}.` : "")}</p>
                                    <SubmitButton>VERIFY CODE</SubmitButton>
                                    <div className="pc-booth__row">
                                        <button type="button" className="pc-link" onClick={() => { setStage(0); setOtpErr(""); }}>
                                            <ArrowBack sx={{ fontSize: 15 }} /> Change email
                                        </button>
                                        <button type="button" className="pc-link" disabled={cool > 0} onClick={resend}>
                                            <Refresh sx={{ fontSize: 15 }} /> {cool > 0 ? `Resend in 0:${String(cool).padStart(2, "0")}` : "Resend code"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {stage === 2 && (
                                <form onSubmit={savePw} noValidate className="pc-stageform">
                                    <h2 id={tid} className="pc-booth__title font-sora">Choose a new password</h2>
                                    <p className="pc-booth__sub">Pick something you haven’t used before.</p>
                                    <PasswordField
                                        id={`${uid}-pw`} label="NEW PASSWORD" value={pw} autoComplete="new-password"
                                        score={scorePassword(pw)} error={pwErr} autoFocusMark
                                        onChange={(e) => setPw(e.target.value)}
                                    />
                                    <PasswordField
                                        id={`${uid}-pw2`} label="CONFIRM PASSWORD" value={pw2} autoComplete="new-password"
                                        error={pw2Err} onChange={(e) => setPw2(e.target.value)}
                                    />
                                    <SubmitButton>SAVE PASSWORD</SubmitButton>
                                </form>
                            )}

                            {stage === 3 && (
                                <div className="pc-done">
                                    <div className="pc-done__mark" aria-hidden="true">
                                        <motion.span
                                            className="pc-done__ring"
                                            initial={{ scale: 0.6, opacity: 0.7 }}
                                            animate={{ scale: 1.9, opacity: 0 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                        <svg viewBox="0 0 80 80" width="84" height="84">
                                            <motion.circle
                                                cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="2.5"
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
                                            />
                                            <motion.path
                                                d="M24 41 l11 11 l22 -24" fill="none" stroke="currentColor" strokeWidth="3.5"
                                                strokeLinecap="round" strokeLinejoin="round"
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                                transition={{ delay: 0.55, duration: 0.45 }}
                                            />
                                        </svg>
                                    </div>
                                    <h2 id={tid} className="pc-booth__title font-sora" role="status">Demo complete</h2>
                                    <p className="pc-booth__sub">
                                        Nothing was saved or changed. With a backend connected, this is where your new password would take effect.
                                    </p>
                                    <button type="button" className="pc-btn group" data-autofocus="" onClick={() => onDone(email.trim())}>
                                        BACK TO SIGN IN
                                        <ArrowForward sx={{ fontSize: 17 }} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <p className="pc-ticket__demo">Demo mode. No email is sent and no password is changed.</p>
            </motion.div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AuthPage({ onLogin, onSignup }) {
    const uid = useId();
    const reduce = useReducedMotion();
    const ctx = useThemeCompat();
    const ctxRef = useRef(ctx);
    ctxRef.current = ctx;
    const ctxDark = readIsDark(ctx);
    const isDark = ctxDark ?? domIsDark();

    const rootRef = useRef(null);
    const loginPaneRef = useRef(null);
    const signupPaneRef = useRef(null);
    const tabRefs = useRef({});
    const timers = useRef(new Set());

    const later = useCallback((fn, ms) => {
        const id = setTimeout(() => { timers.current.delete(id); fn(); }, ms);
        timers.current.add(id);
        return id;
    }, []);
    useEffect(() => {
        const set = timers.current;
        return () => { set.forEach(clearTimeout); set.clear(); };
    }, []);

    /* ---- Lighting: one motion value drives the whole room (CSS var --l) ---- */
    const lightMV = useMotionValue(isDark ? 0 : 1);
    const [step, setStep] = useState(() => (isDark ? 0 : STEPS));
    const lightAnim = useRef(null);
    const wantsDark = step < STEPS / 2;

    useLayoutEffect(() => {
        const paint = (v) => rootRef.current?.style.setProperty("--l", clamp(v, 0, 1).toFixed(3));
        paint(lightMV.get());
        return lightMV.on("change", (v) => {
            paint(v);
            const s = Math.round(clamp(v, 0, 1) * STEPS);
            setStep((p) => (p === s ? p : s));
        });
    }, [lightMV]);

    const goTo = useCallback((target) => {
        lightAnim.current?.stop();
        lightAnim.current = animate(
            lightMV, target,
            reduce ? { duration: 0 } : { type: "spring", stiffness: 85, damping: 13, mass: 1 },
        );
    }, [lightMV, reduce]);

    useEffect(() => () => lightAnim.current?.stop(), []);

    // dial -> your ThemeContext (falls back to the data-theme attribute if the context shape is unknown)
    useEffect(() => {
        const c = ctxRef.current;
        const cur = readIsDark(c) ?? domIsDark();
        if (cur === wantsDark) return;
        if (readIsDark(c) === undefined) {
            document.documentElement.setAttribute("data-theme", wantsDark ? "dark" : "light");
        } else if (typeof c.setTheme === "function") c.setTheme(wantsDark ? "dark" : "light");
        else if (typeof c.toggleTheme === "function") c.toggleTheme();
        else if (typeof c.toggle === "function") c.toggle();
        else if (typeof c.toggleMode === "function") c.toggleMode();
    }, [wantsDark]);

    // your ThemeContext -> dial (when the theme is changed elsewhere)
    useEffect(() => {
        if (ctxDark === undefined) return;
        if (ctxDark !== isDarkAt(lightMV.get())) goTo(ctxDark ? 0 : 1);
    }, [ctxDark, lightMV, goTo]);

    // the bulb flickers when the room changes sides
    const [flick, setFlick] = useState(false);
    const firstFlick = useRef(true);
    useEffect(() => {
        if (firstFlick.current) { firstFlick.current = false; return undefined; }
        if (reduce) return undefined;
        setFlick(true);
        const id = setTimeout(() => setFlick(false), 700);
        return () => clearTimeout(id);
    }, [wantsDark, reduce]);

    // the pool of light follows the pointer, loosely
    const px = useSpring(0, { stiffness: 50, damping: 18 });
    const py = useSpring(0, { stiffness: 50, damping: 18 });
    const onMove = (e) => {
        if (reduce || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width - 0.5) * 60);
        py.set(((e.clientY - r.top) / r.height - 0.5) * 40);
    };

    /* ---- Auth state ---- */
    const [mode, setMode] = useState("login");
    const [login, setLogin] = useState({ email: "", password: "", remember: true });
    const [signup, setSignup] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState({ login: false, signup: false });
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState(null);
    const [booth, setBooth] = useState(false);
    const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

    useInert(loginPaneRef, mode !== "login");
    useInert(signupPaneRef, mode !== "signup");

    const switchMode = (m) => {
        if (m === mode) return;
        setNotice(null);
        setMode(m);
    };

    const tabKey = (e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const next = e.key === "ArrowLeft" || e.key === "Home" ? "login" : "signup";
        switchMode(next);
        tabRefs.current[next]?.focus();
    };

    const loginErr = useMemo(() => ({
        email: !login.email ? "Enter your email" : !EMAIL_RE.test(login.email.trim()) ? "Check this email address" : "",
        password: login.password ? "" : "Enter your password",
    }), [login]);

    const signupErr = useMemo(() => ({
        name: signup.name.trim().length < 2 ? "Enter your full name" : "",
        email: !signup.email ? "Enter your email" : !EMAIL_RE.test(signup.email.trim()) ? "Check this email address" : "",
        password: passwordError(signup.password),
        confirm: !signup.confirm ? "Confirm your password" : signup.confirm !== signup.password ? "Passwords don’t match" : "",
        terms: signup.terms ? "" : "Accept the terms to continue",
    }), [signup]);

    const blur = (m, k) => () => setTouched((t) => ({ ...t, [`${m}.${k}`]: true }));
    const shown = (m, k, errs) => (touched[`${m}.${k}`] || submitted[m] ? errs[k] : "");
    const setL = (k) => (e) => setLogin((p) => ({ ...p, [k]: e.target.value }));
    const setS = (k) => (e) => setSignup((p) => ({ ...p, [k]: e.target.value }));

    const submit = async (e, which) => {
        e.preventDefault();
        const form = e.currentTarget;
        setSubmitted((s) => ({ ...s, [which]: true }));
        const errs = which === "login" ? loginErr : signupErr;
        if (Object.values(errs).some(Boolean)) {
            setNotice({ kind: "err", text: "Fix the highlighted fields to continue." });
            later(() => form.querySelector('[aria-invalid="true"]')?.focus(), 40);
            return;
        }
        setNotice(null);
        setBusy(true);
        const handler = which === "login" ? onLogin : onSignup;
        const values = which === "login"
            ? { email: login.email.trim(), password: login.password, remember: login.remember }
            : { name: signup.name.trim(), email: signup.email.trim(), password: signup.password };
        if (handler) {
            try { await handler(values); }
            catch (err) { setNotice({ kind: "err", text: err?.message || "Something went wrong. Try again." }); }
            finally { setBusy(false); }
            return;
        }
        later(() => {
            setBusy(false);
            setNotice({ kind: "ok", text: "Details look good. Checked in your browser only; no server is connected, so nothing was sent." });
        }, 900);
    };

    const closeBooth = useCallback(() => setBooth(false), []);
    const finishBooth = (email) => {
        setBooth(false);
        if (email) setLogin((p) => ({ ...p, email, password: "" }));
        switchMode("login");
    };

    const idOf = (m, k) => `${uid}-${m}-${k}`;

    return (
        <MotionConfig reducedMotion="user">
            <div
                ref={rootRef}
                className={`pc-root${flick ? " is-flicker" : ""}`}
                onPointerMove={onMove}
            >
                {/* ---- Room: the landing hero image, relit by the dial ---- */}
                <div className="pc-bg" aria-hidden="true">
                    <img
                        className="pc-hero-img pc-hero-img--dark"
                        src="/auth-image.png"
                        alt=""
                    />

                    <img
                        className="pc-hero-img pc-hero-img--light"
                        src="/auth-image-light.png"
                        alt=""
                    />

                    <div className="pc-hero-fade" />
                    <div className="pc-sun" />
                    <div className="pc-cone" />

                    <div className="pc-pool-pos">
                        <motion.div className="pc-pool" style={{ x: px, y: py }} />
                    </div>

                    <div className="pc-fixture">
                        <span className="pc-fixture__lens" />
                    </div>

                    <div className="pc-vignette" />
                    <div className="pc-grain" />
                </div>

                <header className="pc-head">
                    <Brand />
                    <Link
                        to="/"
                        className="font-mono text-xs font-semibold tracking-widest text-[var(--text-secondary)] transition hover:text-[#ff4444]"
                    >
                        BACK TO HOME
                    </Link>
                </header>

                <main className="pc-main">
                    <section className="pc-hero" aria-label="Welcome">
                        <SectionLabel>// SECURE ACCESS</SectionLabel>
                        <h1 className="pc-title font-sora">
                            Step Into The
                            <br />
                            <span className="gradient-text">Interview Room.</span>
                        </h1>
                        <p className="pc-lede text-[var(--text-secondary)]">
                            Practice real interviews, receive personalized feedback and build the
                            confidence to take your next career opportunity.
                        </p>
                        <Dial mv={lightMV} step={step} goTo={goTo} />
                    </section>

                    <section className="pc-stage" aria-label="Account access">
                        <div className="pc-card">
                            <div className="pc-tabs" role="tablist" aria-label="Account" onKeyDown={tabKey}>
                                {[["login", "SIGN IN"], ["signup", "SIGN UP"]].map(([m, label]) => (
                                    <button
                                        key={m}
                                        ref={(el) => { tabRefs.current[m] = el; }}
                                        id={idOf("tab", m)}
                                        type="button"
                                        role="tab"
                                        className="pc-tab"
                                        aria-selected={mode === m}
                                        aria-controls={idOf("panel", m)}
                                        tabIndex={mode === m ? 0 : -1}
                                        onClick={() => switchMode(m)}
                                    >
                                        {mode === m && (
                                            <motion.span layoutId={`${uid}-ind`} className="pc-tab__ind" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                                        )}
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="pc-panes">
                                {/* ---------------- SIGN IN ---------------- */}
                                <motion.div
                                    ref={loginPaneRef}
                                    id={idOf("panel", "login")}
                                    role="tabpanel"
                                    aria-labelledby={idOf("tab", "login")}
                                    className={`pc-pane${mode === "login" ? "" : " is-off"}`}
                                    variants={LOGIN_V}
                                    initial="off"
                                    animate={mode === "login" ? "on" : "off"}
                                >
                                    <form className="pc-form" noValidate onSubmit={(e) => submit(e, "login")}>
                                        <motion.div variants={ITEM}>
                                            <h2 className="pc-card__title font-sora">Welcome back</h2>
                                            <p className="pc-card__sub">Pick up where your last practice session ended.</p>
                                        </motion.div>

                                        <TextField
                                            id={idOf("login", "email")} label="EMAIL" type="email" inputMode="email" autoComplete="email"
                                            value={login.email} onChange={setL("email")} onBlur={blur("login", "email")}
                                            error={shown("login", "email", loginErr)}
                                        />
                                        <PasswordField
                                            id={idOf("login", "password")} label="PASSWORD" autoComplete="current-password"
                                            value={login.password} onChange={setL("password")} onBlur={blur("login", "password")}
                                            error={shown("login", "password", loginErr)}
                                        />

                                        <motion.div className="pc-row" variants={ITEM}>
                                            <label className="pc-check">
                                                <input
                                                    type="checkbox" checked={login.remember}
                                                    onChange={(e) => setLogin((p) => ({ ...p, remember: e.target.checked }))}
                                                />
                                                <span>Remember me</span>
                                            </label>
                                            <button type="button" className="pc-link" onClick={() => setBooth(true)}>Forgot password?</button>
                                        </motion.div>

                                        <motion.aside className="pc-note" variants={ITEM}>
                                            <span>PRACTICE NOTE</span>
                                            <q>{tip}</q>
                                        </motion.aside>

                                        <motion.div variants={ITEM}>
                                            <SubmitButton busy={busy}>SIGN IN</SubmitButton>
                                        </motion.div>
                                        <motion.p className="pc-switch" variants={ITEM}>
                                            New to PrepCoach?{" "}
                                            <button type="button" className="pc-link" onClick={() => switchMode("signup")}>Create an account</button>
                                        </motion.p>
                                    </form>
                                </motion.div>

                                {/* ---------------- SIGN UP ---------------- */}
                                <motion.div
                                    ref={signupPaneRef}
                                    id={idOf("panel", "signup")}
                                    role="tabpanel"
                                    aria-labelledby={idOf("tab", "signup")}
                                    className={`pc-pane${mode === "signup" ? "" : " is-off"}`}
                                    variants={SIGNUP_V}
                                    initial="off"
                                    animate={mode === "signup" ? "on" : "off"}
                                >
                                    <form className="pc-form" noValidate onSubmit={(e) => submit(e, "signup")}>
                                        <motion.div variants={ITEM}>
                                            <h2 className="pc-card__title font-sora">Create your account</h2>
                                            <p className="pc-card__sub">Start practicing with personalized AI feedback.</p>
                                        </motion.div>

                                        <TextField
                                            id={idOf("signup", "name")} label="FULL NAME" autoComplete="name"
                                            value={signup.name} onChange={setS("name")} onBlur={blur("signup", "name")}
                                            error={shown("signup", "name", signupErr)}
                                        />
                                        <TextField
                                            id={idOf("signup", "email")} label="EMAIL" type="email" inputMode="email" autoComplete="email"
                                            value={signup.email} onChange={setS("email")} onBlur={blur("signup", "email")}
                                            error={shown("signup", "email", signupErr)}
                                        />
                                        <PasswordField
                                            id={idOf("signup", "password")} label="PASSWORD" autoComplete="new-password"
                                            value={signup.password} onChange={setS("password")} onBlur={blur("signup", "password")}
                                            score={scorePassword(signup.password)} error={shown("signup", "password", signupErr)}
                                        />
                                        <PasswordField
                                            id={idOf("signup", "confirm")} label="CONFIRM PASSWORD" autoComplete="new-password"
                                            value={signup.confirm} onChange={setS("confirm")} onBlur={blur("signup", "confirm")}
                                            error={shown("signup", "confirm", signupErr)}
                                        />

                                        <motion.div variants={ITEM}>
                                            <label className={`pc-check${shown("signup", "terms", signupErr) ? " is-invalid" : ""}`}>
                                                <input
                                                    type="checkbox" checked={signup.terms}
                                                    aria-invalid={!!shown("signup", "terms", signupErr)}
                                                    onChange={(e) => setSignup((p) => ({ ...p, terms: e.target.checked }))}
                                                />
                                                <span>I agree to the Terms of Use and Privacy Policy</span>
                                            </label>
                                            <span className="pc-sr" role="alert">{shown("signup", "terms", signupErr)}</span>
                                        </motion.div>

                                        <motion.div className="pc-push" variants={ITEM}>
                                            <SubmitButton busy={busy}>CREATE ACCOUNT</SubmitButton>
                                        </motion.div>
                                        <motion.p className="pc-switch" variants={ITEM}>
                                            Already have an account?{" "}
                                            <button type="button" className="pc-link" onClick={() => switchMode("login")}>Sign in</button>
                                        </motion.p>
                                    </form>
                                </motion.div>
                            </div>

                            <p className={`pc-card__note${notice ? ` is-${notice.kind}` : ""}`} role="status">
                                {notice ? notice.text : "Demo build. Validation runs in your browser; no server is connected."}
                            </p>
                        </div>
                    </section>
                </main>

                <footer className="pc-foot">
                    <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                        © {new Date().getFullYear()} PREPCOACH. ALL RIGHTS RESERVED.
                    </p>
                    <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                        BUILT FOR BETTER INTERVIEWS.
                    </p>
                </footer>

                <AnimatePresence>
                    {booth && (
                        <RecoveryBooth key="booth" initialEmail={login.email} onClose={closeBooth} onDone={finishBooth} />
                    )}
                </AnimatePresence>
            </div>
        </MotionConfig>
    );
}