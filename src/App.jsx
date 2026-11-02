
import { motion } from "motion/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

function App() {
  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-xl"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ember to-blood shadow-[0_0_30px_rgba(255,46,46,0.25)]">
          <AutoAwesomeIcon sx={{ fontSize: 34, color: "white" }} />
        </div>

        <h1 className="font-sora text-5xl font-extrabold text-white">
          Prep<span className="text-ember">Coach</span>
        </h1>

        <p className="mt-3 font-mono text-xs tracking-[0.25em] text-ember/60">
          AI INTERVIEW PARTNER
        </p>

        <p className="mt-6 text-white/50">
          Your interview preparation journey starts here.
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 h-1 rounded-full bg-gradient-to-r from-blood via-ember to-coral"
        />
      </motion.div>
    </main>
  );
}

export default App;
