
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
    AutoAwesome,
    Menu,
    X,
    ArrowForward,
    PlayArrow,
    CloudUpload,
    Psychology,
    TrendingUp,
    Insights,
    RecordVoiceOver,
    Analytics,
    CheckCircle,
    Bolt,
    KeyboardArrowRight,
    Star,
    Speed,
    Verified,
    Timeline,
    Close,
} from "@mui/icons-material";
import ThemeToggle from "../components/common/ThemeToggle";

import heroImage from "../assets/images/Hero-image.png";
import ctaImage from "../assets/images/cta-bg.png";

const features = [
    {
        number: "01",
        icon: <Psychology />,
        title: "AI-Powered Questions",
        description:
            "Experience intelligent interview questions tailored to your target role, experience and interview type.",
        tag: "SMART GENERATION",
    },
    {
        number: "02",
        icon: <RecordVoiceOver />,
        title: "Real-Time Practice",
        description:
            "Practice answering interview questions naturally with an interactive interview experience.",
        tag: "LIVE PRACTICE",
    },
    {
        number: "03",
        icon: <Insights />,
        title: "Answer Evaluation",
        description:
            "Understand answer relevance, concept coverage and areas where your responses can improve.",
        tag: "SMART FEEDBACK",
    },
    {
        number: "04",
        icon: <TrendingUp />,
        title: "Progress Tracking",
        description:
            "Monitor your practice history, identify weak areas and track your development over time.",
        tag: "PERFORMANCE",
    },
    {
        number: "05",
        icon: <CloudUpload />,
        title: "Resume-Based Preparation",
        description:
            "Use your resume and target role to create a more relevant and personalized practice experience.",
        tag: "PERSONALIZATION",
    },
    {
        number: "06",
        icon: <Analytics />,
        title: "Performance Analytics",
        description:
            "Explore your strengths and improvement areas through clear performance insights.",
        tag: "ANALYTICS",
    },
];

const steps = [
    {
        number: "01",
        title: "Build Your Profile",
        description:
            "Upload your resume, select your target role and choose your preferred interview category.",
        icon: <CloudUpload />,
    },
    {
        number: "02",
        title: "Start Practicing",
        description:
            "Answer personalized interview questions and experience structured practice sessions.",
        icon: <RecordVoiceOver />,
    },
    {
        number: "03",
        title: "Analyze & Improve",
        description:
            "Review feedback, understand your weak areas and improve with every practice session.",
        icon: <TrendingUp />,
    },
];

const testimonials = [
    {
        quote:
            "PrepCoach helped me identify my weak areas and improved my confidence dramatically.",
        name: "Rohan Desai",
        role: "Software Developer",
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        quote:
            "The structured interview practice helped me organize my thoughts and prepare more effectively.",
        name: "Priya Sharma",
        role: "Product Manager",
        avatar: "https://i.pravatar.cc/150?img=5",
    },
];

const navLinks = [
    ["Home", "#home"],
    ["Features", "#features"],
    ["Process", "#how"],
    ["Results", "#results"],
    ["Stories", "#stories"],
];

function Brand() {
    return (
        <a href="#home" className="flex items-center gap-3 shrink-0">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#ff2e2e] to-[#991b1b] text-white shadow-lg shadow-red-900/25">
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
        </a>
    );
}

function SectionLabel({ children }) {
    return (
        <span className="font-mono text-[11px] font-medium tracking-[.25em] text-[#ff5555]">
            {children}
        </span>
    );
}

function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    const nextTestimonial = () => {
        setActiveTestimonial((current) => (current + 1) % testimonials.length);
    };

    const previousTestimonial = () => {
        setActiveTestimonial(
            (current) => (current - 1 + testimonials.length) % testimonials.length
        );
    };

    const reveal = {
        hidden: { opacity: 0, y: 35 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    return (
        <div className="min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">

            {/* NAVIGATION */}
            <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/85 backdrop-blur-2xl">
                <nav className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 lg:px-12">
                    <Brand />

                    <div className="hidden items-center gap-8 lg:flex">
                        {navLinks.map(([label, href]) => (
                            <a
                                key={label}
                                href={href}
                                className="group relative py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[#ff4444]"
                            >
                                {label}
                                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#ff2e2e] transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-4 lg:flex">
                        <ThemeToggle />

                        <Link
                            to="/practice"
                            className="font-mono text-xs font-semibold tracking-widest text-[var(--text-secondary)] transition hover:text-[#ff4444]"
                        >
                            SIGN IN
                        </Link>

                        <Link
                            to="/practice"
                            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff2e2e] to-[#991b1b] px-6 py-3 font-mono text-xs font-bold tracking-wider text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-1 hover:shadow-red-900/40"
                        >
                            INITIATE
                            <ArrowForward className="text-sm transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <ThemeToggle />

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-color)]"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <Close /> : <Menu />}
                        </button>
                    </div>
                </nav>

                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-6 lg:hidden"
                    >
                        <div className="grid gap-5">
                            {navLinks.map(([label, href]) => (
                                <a
                                    key={label}
                                    href={href}
                                    onClick={() => setMenuOpen(false)}
                                    className="font-mono text-sm tracking-wider text-[var(--text-secondary)] hover:text-[#ff4444]"
                                >
                                    {label}
                                </a>
                            ))}

                            <Link
                                to="/practice"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-full bg-[#ff2e2e] px-5 py-3 text-center font-mono text-sm font-bold text-white"
                            >
                                START PRACTICING →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            <main>

                {/* HERO SECTION */}
                <section
                    id="home"
                    className="relative flex min-h-[780px] items-center overflow-hidden pt-28 lg:min-h-screen"
                >
                    <div className="absolute inset-0">
                        <img
                            src={heroImage}
                            alt="PrepCoach interview preparation"
                            className="h-full w-full object-cover object-center opacity-90"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/20" />

                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]/30" />

                        <div className="absolute inset-0 grid-background opacity-50" />
                    </div>

                    <div className="relative z-10 mx-auto grid w-full max-w-[1500px] items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-12">

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: { staggerChildren: 0.15 },
                                },
                            }}
                        >
                            <motion.div variants={reveal}>
                                <SectionLabel>
                                    PRACTICE / IMPROVE / GET HIRED
                                </SectionLabel>
                            </motion.div>

                            <motion.h1
                                variants={reveal}
                                className="font-sora mt-7 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-[76px]"
                            >
                                Your AI
                                <br />
                                <span className="gradient-text">Interview</span>
                                <br />
                                Partner.
                            </motion.h1>

                            <motion.p
                                variants={reveal}
                                className="mt-7 max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg"
                            >
                                Practice real interviews, receive personalized feedback and
                                build the confidence to take your next career opportunity.
                            </motion.p>

                            <motion.div
                                variants={reveal}
                                className="mt-9 flex flex-wrap items-center gap-4"
                            >
                                <Link
                                    to="/app"
                                    className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff2e2e] to-[#991b1b] px-8 py-4 font-mono text-sm font-bold tracking-wider text-white shadow-xl shadow-red-900/25 transition hover:-translate-y-1 hover:shadow-red-900/50"
                                >
                                    START PRACTICING FREE
                                    <ArrowForward className="transition-transform group-hover:translate-x-1" />
                                </Link>

                                <a
                                    href="#how"
                                    className="flex items-center gap-3 rounded-full border border-[var(--border-color)] px-7 py-4 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[#ff2e2e]/50 hover:text-[#ff4444]"
                                >
                                    <PlayArrow />
                                    HOW IT WORKS
                                </a>
                            </motion.div>

                            <motion.div
                                variants={reveal}
                                className="mt-12 flex flex-wrap gap-7"
                            >
                                {[
                                    ["AI", "Powered Feedback"],
                                    ["24/7", "Practice Anytime"],
                                    ["∞", "Learn & Improve"],
                                ].map(([value, label]) => (
                                    <div key={label}>
                                        <p className="font-sora text-xl font-bold text-[#ff4444]">
                                            {value}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* FEATURE SECTION */}
                <section id="features" className="relative py-28">
                    <div className="mx-auto max-w-[1500px] px-5 lg:px-12">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={reveal}
                            className="mx-auto max-w-2xl text-center"
                        >
                            <SectionLabel>// 01 — CAPABILITIES</SectionLabel>

                            <h2 className="font-sora mt-5 text-4xl font-extrabold sm:text-5xl">
                                Everything You Need
                                <br />
                                <span className="gradient-text">To Stand Out.</span>
                            </h2>

                            <p className="mt-6 leading-8 text-[var(--text-secondary)]">
                                A complete interview preparation experience designed to help
                                you practice smarter, understand your performance and improve
                                your answers.
                            </p>
                        </motion.div>

                        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <motion.article
                                    key={feature.number}
                                    initial={{ opacity: 0, y: 35 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{ duration: 0.6, delay: index * 0.08 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative overflow-hidden rounded-[26px] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 transition-colors hover:border-[#ff2e2e]/40"
                                >
                                    <div className="absolute right-6 top-6 font-mono text-xs tracking-widest text-[#ff2e2e]/50">
                                        {feature.number}
                                    </div>

                                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#ff2e2e]/20 bg-[#ff2e2e]/10 text-[#ff4444] transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#ff2e2e]/20">
                                        {feature.icon}
                                    </div>

                                    <p className="mt-8 font-mono text-[9px] tracking-[.2em] text-[#ff5555]">
                                        {feature.tag}
                                    </p>

                                    <h3 className="font-sora mt-3 text-xl font-bold">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                                        {feature.description}
                                    </p>

                                    <div className="mt-7 flex items-center gap-2 text-xs font-bold tracking-wider text-[#ff5555]">
                                        EXPLORE
                                        <ArrowForward className="text-sm transition-transform group-hover:translate-x-2" />
                                    </div>

                                    <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-red-600/10 blur-[60px] transition group-hover:bg-red-600/20" />
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PROCESS SECTION */}
                <section
                    id="how"
                    className="relative overflow-hidden border-y border-[var(--border-color)] bg-[var(--bg-secondary)] py-28"
                >
                    <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/5 blur-[120px]" />

                    <div className="relative mx-auto max-w-[1500px] px-5 lg:px-12">
                        <div className="mx-auto max-w-2xl text-center">
                            <SectionLabel>// 02 — THE PROCESS</SectionLabel>

                            <h2 className="font-sora mt-5 text-4xl font-extrabold sm:text-6xl">
                                Three Steps To
                                <br />
                                <span className="gradient-text">Interview Ready.</span>
                            </h2>
                        </div>

                        <div className="relative mt-20 grid gap-12 md:grid-cols-3">
                            <div className="absolute left-[17%] right-[17%] top-12 hidden h-px bg-gradient-to-r from-transparent via-[#ff2e2e]/40 to-transparent md:block" />

                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 35 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="relative text-center"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#ff2e2e]/40 bg-gradient-to-br from-[#ff2e2e] to-[#991b1b] text-3xl text-white shadow-xl shadow-red-900/25"
                                    >
                                        {step.icon}
                                    </motion.div>

                                    <p className="mt-7 font-mono text-xs tracking-[.25em] text-[#ff5555]">
                                        STEP {step.number}
                                    </p>

                                    <h3 className="font-sora mt-4 text-xl font-bold">
                                        {step.title}
                                    </h3>

                                    <p className="mx-auto mt-4 max-w-[300px] text-sm leading-7 text-[var(--text-secondary)]">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* RESULTS SECTION */}
                <section id="results" className="relative py-28">
                    <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-5 lg:grid-cols-2 lg:px-12">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <SectionLabel>// 03 — YOUR PERFORMANCE</SectionLabel>

                            <h2 className="font-sora mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
                                Know Your
                                <br />
                                <span className="gradient-text">Strengths.</span>
                                <br />
                                Improve Your Weaknesses.
                            </h2>

                            <p className="mt-7 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
                                Every practice session provides an opportunity to learn.
                                Review your answers, understand your improvement areas and
                                make your preparation more focused.
                            </p>

                            <div className="mt-9 space-y-5">
                                {[
                                    "Understand answer relevance and concept coverage",
                                    "Identify strengths and improvement areas",
                                    "Track your practice performance over time",
                                    "Get actionable recommendations for future sessions",
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 text-[#ff4444]" />
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/practice"
                                className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#ff2e2e] px-7 py-4 font-mono text-xs font-bold tracking-wider text-white transition hover:-translate-y-1 hover:bg-[#dc2626]"
                            >
                                START YOUR JOURNEY
                                <ArrowForward />
                            </Link>
                        </motion.div>

                        {/* ANALYTICS PREVIEW */}
                        <motion.div
                            initial={{ opacity: 0, x: 40, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="glass relative rounded-[30px] p-6 shadow-2xl sm:p-9"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-[10px] tracking-widest text-[#ff5555]">
                                        PERFORMANCE OVERVIEW
                                    </p>
                                    <h3 className="font-sora mt-2 text-xl font-bold">
                                        Your Analytics
                                    </h3>
                                </div>
                                <Timeline className="text-[#ff4444]" />
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {[
                                    ["Technical", "90%", "Strong"],
                                    ["Communication", "85%", "Good"],
                                    ["Relevance", "82%", "Good"],
                                    ["Confidence", "78%", "Growing"],
                                ].map(([label, value, status]) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5"
                                    >
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {label}
                                        </p>
                                        <p className="font-sora mt-3 text-3xl font-bold">
                                            {value}
                                        </p>
                                        <p className="mt-2 text-[10px] font-semibold text-[#ff5555]">
                                            {status}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl border border-[#ff2e2e]/20 bg-[#ff2e2e]/5 p-5">
                                <div className="flex items-center gap-2 text-[#ff5555]">
                                    <AutoAwesome fontSize="small" />
                                    <p className="font-mono text-[10px] tracking-widest">
                                        PRACTICE INSIGHT
                                    </p>
                                </div>
                                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                                    Focus on supporting technical explanations with practical
                                    examples to make your answers more structured.
                                </p>
                            </div>

                            <p className="mt-5 text-[10px] leading-5 text-[var(--text-muted)]">
                                Illustrative performance preview. Actual evaluations depend
                                on your practice responses.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section
                    id="stories"
                    className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)] py-28"
                >
                    <div className="mx-auto max-w-[1100px] px-5 lg:px-12">
                        <div className="text-center">
                            <SectionLabel>// 04 — USER STORIES</SectionLabel>

                            <h2 className="font-sora mt-5 text-4xl font-extrabold sm:text-5xl">
                                From Practice
                                <br />
                                <span className="gradient-text">To Progress.</span>
                            </h2>

                            <p className="mt-5 text-sm text-[var(--text-secondary)]">
                                A better way to prepare for your next opportunity.
                            </p>
                        </div>

                        <motion.div
                            key={activeTestimonial}
                            initial={{ opacity: 0, x: 35 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mt-14 rounded-[30px] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-xl sm:p-12"
                        >
                            <div className="flex gap-1 text-[#ff5555]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} fontSize="small" />
                                ))}
                            </div>

                            <blockquote className="font-sora mt-8 text-2xl font-semibold leading-relaxed sm:text-3xl">
                                "{testimonials[activeTestimonial].quote}"
                            </blockquote>

                            <div className="mt-9 flex items-center gap-4">
                                <img
                                    src={testimonials[activeTestimonial].avatar}
                                    alt=""
                                    className="h-14 w-14 rounded-full border-2 border-[#ff2e2e]/30 object-cover"
                                />

                                <div>
                                    <p className="font-sora font-bold">
                                        {testimonials[activeTestimonial].name}
                                    </p>
                                    <p className="mt-1 font-mono text-[10px] tracking-widest text-[#ff5555]">
                                        {testimonials[activeTestimonial].role.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="mt-7 flex justify-center gap-3">
                            <button
                                onClick={previousTestimonial}
                                aria-label="Previous testimonial"
                                className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border-color)] transition hover:border-[#ff2e2e] hover:text-[#ff4444]"
                            >
                                <KeyboardArrowRight className="rotate-180" />
                            </button>

                            <button
                                onClick={nextTestimonial}
                                aria-label="Next testimonial"
                                className="grid h-12 w-12 place-items-center rounded-full bg-[#ff2e2e] text-white transition hover:bg-[#dc2626]"
                            >
                                <KeyboardArrowRight />
                            </button>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="relative overflow-hidden py-28">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,46,46,0.16),transparent_65%)]" />

                    <motion.div
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative mx-auto max-w-[1300px] px-5 lg:px-12"
                    >
                        <div className="relative overflow-hidden rounded-[35px] border border-[#ff2e2e]/20 bg-gradient-to-br from-[#191010] to-[#080808] p-9 text-white sm:p-16">
                            <img
                                src={ctaImage}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/75 via-[#080808]/25 to-[#080808]/30" />
                            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-red-600/15 blur-[100px]" />

                            <div className="relative z-10 max-w-3xl">
                                <SectionLabel>// FINAL TRANSMISSION</SectionLabel>

                                <h2 className="font-sora mt-7 text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                                    Ready To
                                    <br />
                                    <span className="gradient-text">Level Up?</span>
                                </h2>

                                <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
                                    Your next opportunity deserves your best preparation.
                                    Start practicing, understand your performance and keep
                                    improving.
                                </p>

                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Link
                                        to="/practice"
                                        className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff2e2e] to-[#991b1b] px-9 py-5 font-mono text-xs font-bold tracking-wider text-white shadow-xl shadow-red-900/30 transition hover:-translate-y-1"
                                    >
                                        INITIATE TRAINING
                                        <ArrowForward />
                                    </Link>

                                    <a
                                        href="#how"
                                        className="rounded-full border border-white/20 px-8 py-5 font-mono text-xs font-bold tracking-wider text-white/80 transition hover:border-[#ff4444] hover:text-[#ff5555]"
                                    >
                                        EXPLORE PROCESS
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-12">
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <Brand />

                            <p className="mt-6 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
                                An AI-powered interview preparation platform designed to help
                                students and job seekers practice, evaluate their answers and
                                prepare with confidence.
                            </p>

                            <p className="mt-7 font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                                PRACTICE. IMPROVE. SUCCEED.
                            </p>
                        </div>

                        <div>
                            <p className="font-mono text-xs tracking-widest text-[#ff5555]">
                                PLATFORM
                            </p>
                            <div className="mt-6 grid gap-4 text-sm text-[var(--text-secondary)]">
                                <a href="#features" className="hover:text-[#ff4444]">Features</a>
                                <a href="#how" className="hover:text-[#ff4444]">How It Works</a>
                                <a href="#results" className="hover:text-[#ff4444]">Analytics</a>
                                <Link to="/practice" className="hover:text-[#ff4444]">Practice</Link>
                            </div>
                        </div>

                        <div>
                            <p className="font-mono text-xs tracking-widest text-[#ff5555]">
                                EXPLORE
                            </p>
                            <div className="mt-6 grid gap-4 text-sm text-[var(--text-secondary)]">
                                <a href="#stories" className="hover:text-[#ff4444]">User Stories</a>
                                <Link to="/dashboard" className="hover:text-[#ff4444]">Dashboard</Link>
                                <Link to="/history" className="hover:text-[#ff4444]">History</Link>
                                <Link to="/profile" className="hover:text-[#ff4444]">Profile</Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-14 flex flex-col justify-between gap-4 border-t border-[var(--border-color)] pt-8 sm:flex-row">
                        <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                            © 2026 PREPCOACH. ALL RIGHTS RESERVED.
                        </p>

                        <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                            BUILT FOR BETTER INTERVIEWS.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
