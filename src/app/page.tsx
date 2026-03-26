"use client";
import { motion } from "framer-motion";
import Coding from "@/LottieFiles/anims/Coding";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Home = () => {
  return (
    <main className="relative min-h-screen h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-fuchsia-50" />
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-fuchsia-300/10 blur-3xl" />

      {/* Logo Header */}
      <div className="absolute top-6 left-6 md:left-10 flex items-center gap-3">
        <Image
          src="/images/clg-logo.png"
          alt="College Logo"
          width={60}
          height={60}
          className="rounded-lg shadow-md"
        />
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary">Testy</span>
          <span className="text-xs text-muted-foreground">Examination Platform</span>
        </div>
      </div>

      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-10">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Hero content */}
          <section className="flex flex-col gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-primary"
            >
              Welcome to Testy
              <br />
              Online Examination Platform
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base md:text-lg text-muted-foreground max-w-prose"
            >
              Secure, timed assessments with encrypted questions and instant
              results. Teachers upload once, students test anywhere.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              <Button size="lg" className="h-11 px-6 text-base" asChild>
                <a href="/login">Log In</a>
              </Button>
            </motion.div>
            <div className="text-xs text-muted-foreground mt-2">
              Admin • Teacher • Student portals with role-based access
            </div>
          </section>

          {/* Right: Lottie illustration */}
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="w-full flex items-center justify-center"
          >
            <div className="w-[280px] md:w-[360px] lg:w-[420px] drop-shadow-sm">
              <Coding />
            </div>
          </motion.section>
        </div>
      </div>

      {/* Footer strip */}
      <div className="absolute bottom-0 left-0 right-0 py-3 text-center text-xs text-muted-foreground/80">
        © {new Date().getFullYear()} Testy. All rights reserved.
      </div>
    </main>
  );
};

export default Home;
